use common::models::{AiAnalysis, User};
use common::metrics::{Timer, AI_ANALYSIS_TIME};
use common::retry::{retry, RetryConfig};
use common::bulkhead::{Bulkhead, BulkheadError};
use common::cache::{MemoryCache, CacheConfig, CacheError};
use common::events::{Event, EventConfig, MemoryEventBus};
use reqwest::Client;
use serde_json::json;
use sqlx::PgPool;
use std::error::Error;
use uuid::Uuid;
use chrono::Utc;
use log::{error, info};
use std::time::Duration;
use std::sync::Arc;
use std::collections::HashMap;

pub struct AiService {
    pool: PgPool,
    ollama_client: Client,
    ollama_url: String,
    model: String,
    bulkhead: Arc<Bulkhead>,
    cache: Arc<MemoryCache<String, AiAnalysis>>,
    event_bus: Arc<MemoryEventBus>,
}

impl AiService {
    pub fn new(pool: &PgPool, ollama_url: String, model: String) -> Self {
        Self {
            pool: pool.clone(),
            ollama_client: Client::new(),
            ollama_url,
            model,
            bulkhead: Arc::new(Bulkhead::new(10, 5000)), // 10 requisições concorrentes, timeout 5s
            cache: Arc::new(MemoryCache::new(CacheConfig {
                ttl: Duration::from_secs(300), // Cache por 5 minutos
                max_size: 1000,
            })),
            event_bus: Arc::new(MemoryEventBus::new(EventConfig::default())),
        }
    }

    pub async fn analyze_risk(&self, user: &User) -> Result<AiAnalysis, Box<dyn Error>> {
        info!("Iniciando análise de risco para usuário: {}", user.id);
        let _timer = Timer::new(&AI_ANALYSIS_TIME);

        // Tentar obter do cache primeiro
        let cache_key = format!("analysis:{}", user.id);
        if let Some(cached_analysis) = self.cache.get(cache_key.clone()).await? {
            info!("Análise encontrada no cache para usuário: {}", user.id);
            return Ok(cached_analysis);
        }

        // Configuração de retry
        let retry_config = RetryConfig {
            max_attempts: 3,
            initial_delay: Duration::from_millis(100),
            max_delay: Duration::from_secs(1),
            multiplier: 2.0,
        };

        // Consultar transações do usuário com retry
        let transactions = retry(
            || async {
                sqlx::query!(
                    "SELECT * FROM blockchain_verifications WHERE user_id = $1",
                    user.id
                )
                .fetch_all(&self.pool)
                .await
                .map_err(|e| e.into())
            },
            retry_config.clone(),
            |e| e.to_string().contains("deadlock"),
        )
        .await?;

        // Consultar provas ZKP do usuário com retry
        let zkp_proofs = retry(
            || async {
                sqlx::query!(
                    "SELECT * FROM zkp_proofs WHERE user_id = $1",
                    user.id
                )
                .fetch_all(&self.pool)
                .await
                .map_err(|e| e.into())
            },
            retry_config.clone(),
            |e| e.to_string().contains("deadlock"),
        )
        .await?;

        // Preparar prompt para o Ollama
        let prompt = json!({
            "model": self.model,
            "prompt": format!(
                "Analise o risco do usuário com base nos seguintes dados:\n\
                Endereço da carteira: {}\n\
                Número de transações: {}\n\
                Número de provas ZKP: {}\n\
                Retorne um score de risco entre 0 e 100, onde 0 é risco mínimo e 100 é risco máximo.",
                user.wallet_address,
                transactions.len(),
                zkp_proofs.len()
            ),
            "stream": false
        });

        // Fazer requisição para o Ollama com bulkhead e retry
        let response = self.bulkhead
            .execute(|| async {
                retry(
                    || async {
                        self.ollama_client
                            .post(format!("{}/api/generate", self.ollama_url))
                            .json(&prompt)
                            .send()
                            .await?
                            .json::<serde_json::Value>()
                            .await
                            .map_err(|e| e.into())
                    },
                    retry_config.clone(),
                    |e| e.to_string().contains("timeout") || e.to_string().contains("connection refused"),
                )
                .await
            })
            .await?;

        // Extrair score de risco da resposta
        let risk_score = response["response"]
            .as_str()
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(50.0);

        info!("Score de risco calculado: {}", risk_score);

        // Criar análise
        let analysis = AiAnalysis {
            id: Uuid::new_v4(),
            user_id: user.id,
            risk_score,
            analysis_data: json!({
                "transactions_count": transactions.len(),
                "zkp_proofs_count": zkp_proofs.len(),
                "model_response": response
            }),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        // Salvar análise no banco com retry
        retry(
            || async {
                sqlx::query!(
                    "INSERT INTO ai_analyses (id, user_id, risk_score, analysis_data, created_at, updated_at) \
                    VALUES ($1, $2, $3, $4, $5, $6)",
                    analysis.id,
                    analysis.user_id,
                    analysis.risk_score,
                    analysis.analysis_data,
                    analysis.created_at,
                    analysis.updated_at
                )
                .execute(&self.pool)
                .await
                .map_err(|e| e.into())
            },
            retry_config,
            |e| e.to_string().contains("deadlock"),
        )
        .await?;

        // Armazenar no cache
        self.cache.set(cache_key, analysis.clone()).await?;

        // Publicar evento de nova análise
        let mut metadata = HashMap::new();
        metadata.insert("user_id".to_string(), user.id.to_string());
        metadata.insert("risk_score".to_string(), risk_score.to_string());

        let event = Event {
            id: Uuid::new_v4().to_string(),
            event_type: "analysis.completed".to_string(),
            payload: serde_json::to_value(&analysis)?,
            timestamp: Utc::now(),
            metadata,
        };

        self.event_bus.publish(event).await?;

        Ok(analysis)
    }

    pub async fn get_analysis(&self, analysis_id: Uuid) -> Result<Option<AiAnalysis>, Box<dyn Error>> {
        info!("Buscando análise: {}", analysis_id);
        let _timer = Timer::new(&AI_ANALYSIS_TIME);

        // Tentar obter do cache primeiro
        let cache_key = format!("analysis:{}", analysis_id);
        if let Some(cached_analysis) = self.cache.get(cache_key.clone()).await? {
            info!("Análise encontrada no cache: {}", analysis_id);
            return Ok(Some(cached_analysis));
        }

        let retry_config = RetryConfig {
            max_attempts: 3,
            initial_delay: Duration::from_millis(100),
            max_delay: Duration::from_secs(1),
            multiplier: 2.0,
        };

        let analysis = retry(
            || async {
                sqlx::query_as!(
                    AiAnalysis,
                    "SELECT * FROM ai_analyses WHERE id = $1",
                    analysis_id
                )
                .fetch_optional(&self.pool)
                .await
                .map_err(|e| e.into())
            },
            retry_config,
            |e| e.to_string().contains("deadlock"),
        )
        .await?;

        // Se encontrou a análise, armazena no cache
        if let Some(analysis) = analysis.clone() {
            self.cache.set(cache_key, analysis).await?;
        }

        Ok(analysis)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use mockall::predicate::*;
    use mockall::*;

    mock! {
        Client {
            fn post(&self, url: String) -> MockResponse;
        }
    }

    mock! {
        Response {
            fn json<T>(&self) -> Result<T, reqwest::Error>;
        }
    }

    #[tokio::test]
    async fn test_analyze_risk() {
        // TODO: Implementar testes
    }
} 