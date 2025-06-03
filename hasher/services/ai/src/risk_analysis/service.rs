use super::{RiskAnalysisRequest, RiskAnalysisResponse, RiskFactor, RiskSeverity};
use actix_web::web;
use elasticsearch::Elasticsearch;
use redis::Client as RedisClient;
use reqwest::Client;
use std::sync::Arc;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum RiskAnalysisError {
    #[error("Erro ao analisar risco: {0}")]
    AnalysisError(String),
    #[error("Erro no Ollama: {0}")]
    OllamaError(#[from] reqwest::Error),
    #[error("Erro no Redis: {0}")]
    RedisError(#[from] redis::RedisError),
    #[error("Erro no Elasticsearch: {0}")]
    ElasticsearchError(String),
}

impl actix_web::error::ResponseError for RiskAnalysisError {}

pub struct RiskAnalysisService {
    ollama_client: Client,
    redis_client: RedisClient,
    elasticsearch_client: Arc<Elasticsearch>,
    config: crate::config::Config,
}

impl RiskAnalysisService {
    pub fn new(config: crate::config::Config) -> Self {
        let ollama_client = Client::new();
        let redis_client = RedisClient::open(config.redis_url.clone())
            .expect("Falha ao conectar ao Redis");
        let elasticsearch_client = Arc::new(Elasticsearch::default());

        Self {
            ollama_client,
            redis_client,
            elasticsearch_client,
            config,
        }
    }

    pub async fn analyze_risk(&self, request: RiskAnalysisRequest) -> Result<RiskAnalysisResponse, RiskAnalysisError> {
        // Verificar cache Redis
        let cache_key = format!("risk:{}:{}",
            request.transaction_data.transaction_type,
            request.transaction_data.amount
        );
        
        let mut redis_conn = self.redis_client.get_async_connection().await?;
        
        if let Ok(cached) = redis::cmd("GET")
            .arg(&cache_key)
            .query_async::<_, String>(&mut redis_conn)
            .await
        {
            return Ok(serde_json::from_str(&cached)
                .map_err(|e| RiskAnalysisError::AnalysisError(e.to_string()))?);
        }

        // Buscar padrões de risco no Elasticsearch
        let risk_patterns = self.search_risk_patterns(&request).await?;

        // Analisar com IA
        let ollama_response = self.ollama_client
            .post(&format!("{}/api/generate", self.config.ollama_url))
            .json(&serde_json::json!({
                "model": self.config.ollama_model,
                "prompt": format!(
                    "Analise o risco da seguinte transação:\n{}\n\nHistórico do usuário:\n{}\n\nPadrões de risco conhecidos:\n{}", 
                    serde_json::to_string_pretty(&request.transaction_data).unwrap(),
                    serde_json::to_string_pretty(&request.user_history).unwrap(),
                    risk_patterns.join("\n")
                ),
                "stream": false
            }))
            .send()
            .await?
            .json::<serde_json::Value>()
            .await?;

        let ai_analysis = ollama_response["response"].as_str()
            .ok_or_else(|| RiskAnalysisError::AnalysisError("Resposta inválida do Ollama".to_string()))?;

        // Processar análise da IA
        let response = self.process_ai_analysis(ai_analysis)?;

        // Armazenar no cache
        redis::cmd("SETEX")
            .arg(&cache_key)
            .arg(300) // TTL de 5 minutos
            .arg(serde_json::to_string(&response)
                .map_err(|e| RiskAnalysisError::AnalysisError(e.to_string()))?)
            .query_async::<_, ()>(&mut redis_conn)
            .await?;

        Ok(response)
    }

    async fn search_risk_patterns(&self, request: &RiskAnalysisRequest) -> Result<Vec<String>, RiskAnalysisError> {
        let response = self.elasticsearch_client
            .search(elasticsearch::SearchParts::Index(&["risk_patterns"]))
            .body(json!({
                "query": {
                    "bool": {
                        "should": [
                            { "match": { "transaction_type": request.transaction_data.transaction_type }},
                            { "range": { "amount": { "gte": request.transaction_data.amount * 0.8, "lte": request.transaction_data.amount * 1.2 }}},
                            { "match": { "currency": request.transaction_data.currency }}
                        ]
                    }
                },
                "size": 10
            }))
            .send()
            .await
            .map_err(|e| RiskAnalysisError::ElasticsearchError(e.to_string()))?;

        let response_body = response
            .json::<serde_json::Value>()
            .await
            .map_err(|e| RiskAnalysisError::ElasticsearchError(e.to_string()))?;

        Ok(response_body["hits"]["hits"]
            .as_array()
            .unwrap_or(&Vec::new())
            .iter()
            .filter_map(|hit| hit["_source"]["pattern"].as_str())
            .map(String::from)
            .collect())
    }

    fn process_ai_analysis(&self, analysis: &str) -> Result<RiskAnalysisResponse, RiskAnalysisError> {
        // TODO: Implementar processamento mais sofisticado da resposta da IA
        let risk_score = if analysis.contains("alto risco") {
            0.8
        } else if analysis.contains("médio risco") {
            0.5
        } else {
            0.2
        };

        let risk_factors = vec![
            RiskFactor {
                factor: "Valor da transação".to_string(),
                severity: if risk_score > 0.7 { RiskSeverity::High } else { RiskSeverity::Medium },
                description: "Valor acima do padrão histórico".to_string(),
            }
        ];

        let recommendations = vec![
            "Verificar identidade do usuário".to_string(),
            "Solicitar confirmação adicional".to_string(),
        ];

        Ok(RiskAnalysisResponse {
            risk_score,
            risk_factors,
            recommendations,
        })
    }
} 