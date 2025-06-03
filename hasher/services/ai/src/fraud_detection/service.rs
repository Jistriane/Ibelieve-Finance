use super::{
    FraudDetectionRequest, FraudDetectionResponse, FraudIndicator,
    FraudIndicatorType, Severity, Location,
};
use actix_web::web;
use elasticsearch::Elasticsearch;
use redis::Client as RedisClient;
use reqwest::Client;
use std::sync::Arc;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum FraudDetectionError {
    #[error("Erro ao detectar fraude: {0}")]
    DetectionError(String),
    #[error("Erro no Ollama: {0}")]
    OllamaError(#[from] reqwest::Error),
    #[error("Erro no Redis: {0}")]
    RedisError(#[from] redis::RedisError),
    #[error("Erro no Elasticsearch: {0}")]
    ElasticsearchError(String),
}

impl actix_web::error::ResponseError for FraudDetectionError {}

pub struct FraudDetectionService {
    ollama_client: Client,
    redis_client: RedisClient,
    elasticsearch_client: Arc<Elasticsearch>,
    config: crate::config::Config,
}

impl FraudDetectionService {
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

    pub async fn detect_fraud(&self, request: FraudDetectionRequest) -> Result<FraudDetectionResponse, FraudDetectionError> {
        // Verificar cache Redis
        let cache_key = format!("fraud:{}:{}",
            request.user_profile.user_id,
            request.transaction_data.timestamp.timestamp()
        );
        
        let mut redis_conn = self.redis_client.get_async_connection().await?;
        
        if let Ok(cached) = redis::cmd("GET")
            .arg(&cache_key)
            .query_async::<_, String>(&mut redis_conn)
            .await
        {
            return Ok(serde_json::from_str(&cached)
                .map_err(|e| FraudDetectionError::DetectionError(e.to_string()))?);
        }

        // Buscar padrões de fraude no Elasticsearch
        let fraud_patterns = self.search_fraud_patterns(&request).await?;

        // Analisar com IA
        let ollama_response = self.ollama_client
            .post(&format!("{}/api/generate", self.config.ollama_url))
            .json(&serde_json::json!({
                "model": self.config.ollama_model,
                "prompt": format!(
                    "Analise a seguinte transação para detecção de fraude:\n\nTransação:\n{}\n\nPerfil do Usuário:\n{}\n\nInformações do Dispositivo:\n{}\n\nPadrões de Fraude Conhecidos:\n{}", 
                    serde_json::to_string_pretty(&request.transaction_data).unwrap(),
                    serde_json::to_string_pretty(&request.user_profile).unwrap(),
                    serde_json::to_string_pretty(&request.device_info).unwrap(),
                    fraud_patterns.join("\n")
                ),
                "stream": false
            }))
            .send()
            .await?
            .json::<serde_json::Value>()
            .await?;

        let ai_analysis = ollama_response["response"].as_str()
            .ok_or_else(|| FraudDetectionError::DetectionError("Resposta inválida do Ollama".to_string()))?;

        // Processar análise da IA
        let response = self.process_ai_analysis(ai_analysis, &request)?;

        // Armazenar no cache
        redis::cmd("SETEX")
            .arg(&cache_key)
            .arg(300) // TTL de 5 minutos
            .arg(serde_json::to_string(&response)
                .map_err(|e| FraudDetectionError::DetectionError(e.to_string()))?)
            .query_async::<_, ()>(&mut redis_conn)
            .await?;

        Ok(response)
    }

    async fn search_fraud_patterns(&self, request: &FraudDetectionRequest) -> Result<Vec<String>, FraudDetectionError> {
        let response = self.elasticsearch_client
            .search(elasticsearch::SearchParts::Index(&["fraud_patterns"]))
            .body(json!({
                "query": {
                    "bool": {
                        "should": [
                            { "match": { "payment_method": request.transaction_data.payment_method }},
                            { "range": { "amount": { 
                                "gte": request.transaction_data.amount * 0.8,
                                "lte": request.transaction_data.amount * 1.2
                            }}},
                            { "match": { "merchant_category": request.transaction_data.merchant }},
                            { "match": { "device_type": request.device_info.user_agent }},
                            { "match": { "country": request.transaction_data.location.as_ref().map(|l| &l.country) }}
                        ]
                    }
                },
                "size": 10
            }))
            .send()
            .await
            .map_err(|e| FraudDetectionError::ElasticsearchError(e.to_string()))?;

        let response_body = response
            .json::<serde_json::Value>()
            .await
            .map_err(|e| FraudDetectionError::ElasticsearchError(e.to_string()))?;

        Ok(response_body["hits"]["hits"]
            .as_array()
            .unwrap_or(&Vec::new())
            .iter()
            .filter_map(|hit| hit["_source"]["pattern"].as_str())
            .map(String::from)
            .collect())
    }

    fn process_ai_analysis(&self, analysis: &str, request: &FraudDetectionRequest) -> Result<FraudDetectionResponse, FraudDetectionError> {
        let mut indicators = Vec::new();
        let mut is_fraudulent = false;
        let mut confidence_score = 0.0;

        // Verificar localização incomum
        if let (Some(tx_location), Some(typical_location)) = (
            &request.transaction_data.location,
            request.user_profile.typical_locations.first()
        ) {
            if tx_location.country != typical_location.country {
                indicators.push(FraudIndicator {
                    indicator_type: FraudIndicatorType::UnusualLocation,
                    severity: Severity::High,
                    description: "Transação em país diferente do usual".to_string(),
                    confidence: 0.9,
                });
                is_fraudulent = true;
                confidence_score += 0.9;
            }
        }

        // Verificar valor incomum
        if request.transaction_data.amount > request.user_profile.typical_transaction_amount * 3.0 {
            indicators.push(FraudIndicator {
                indicator_type: FraudIndicatorType::UnusualAmount,
                severity: Severity::Medium,
                description: "Valor da transação muito acima do padrão".to_string(),
                confidence: 0.7,
            });
            confidence_score += 0.7;
        }

        // Verificar dispositivo desconhecido
        if !request.device_info.is_known_device {
            indicators.push(FraudIndicator {
                indicator_type: FraudIndicatorType::UnusualDevice,
                severity: Severity::Medium,
                description: "Dispositivo não reconhecido".to_string(),
                confidence: 0.6,
            });
            confidence_score += 0.6;
        }

        // Normalizar score de confiança
        confidence_score = confidence_score / indicators.len() as f32;

        let recommended_actions = if is_fraudulent {
            vec![
                "Bloquear transação".to_string(),
                "Notificar usuário".to_string(),
                "Solicitar verificação adicional".to_string(),
            ]
        } else {
            vec![
                "Monitorar atividade futura".to_string(),
                "Atualizar perfil de risco".to_string(),
            ]
        };

        Ok(FraudDetectionResponse {
            is_fraudulent,
            confidence_score,
            fraud_indicators: indicators,
            recommended_actions,
        })
    }
} 