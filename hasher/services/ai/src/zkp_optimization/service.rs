use super::{ZkpOptimizationRequest, ZkpOptimizationResponse, PerformanceMetrics, OptimizationTarget};
use actix_web::web;
use elasticsearch::Elasticsearch;
use redis::Client as RedisClient;
use reqwest::Client;
use std::sync::Arc;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ZkpOptimizationError {
    #[error("Erro ao otimizar circuito: {0}")]
    OptimizationError(String),
    #[error("Erro no Ollama: {0}")]
    OllamaError(#[from] reqwest::Error),
    #[error("Erro no Redis: {0}")]
    RedisError(#[from] redis::RedisError),
    #[error("Erro no Elasticsearch: {0}")]
    ElasticsearchError(String),
}

impl actix_web::error::ResponseError for ZkpOptimizationError {}

pub struct ZkpOptimizationService {
    ollama_client: Client,
    redis_client: RedisClient,
    elasticsearch_client: Arc<Elasticsearch>,
    config: crate::config::Config,
}

impl ZkpOptimizationService {
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

    pub async fn optimize_circuit(&self, request: ZkpOptimizationRequest) -> Result<ZkpOptimizationResponse, ZkpOptimizationError> {
        // Verificar cache Redis
        let cache_key = format!("zkp:{}:{}",
            request.circuit,
            serde_json::to_string(&request.optimization_target).unwrap()
        );
        
        let mut redis_conn = self.redis_client.get_async_connection().await?;
        
        if let Ok(cached) = redis::cmd("GET")
            .arg(&cache_key)
            .query_async::<_, String>(&mut redis_conn)
            .await
        {
            return Ok(serde_json::from_str(&cached)
                .map_err(|e| ZkpOptimizationError::OptimizationError(e.to_string()))?);
        }

        // Buscar otimizações similares no Elasticsearch
        let similar_optimizations = self.search_similar_optimizations(&request).await?;

        // Otimizar com IA
        let ollama_response = self.ollama_client
            .post(&format!("{}/api/generate", self.config.ollama_url))
            .json(&serde_json::json!({
                "model": self.config.ollama_model,
                "prompt": format!(
                    "Otimize o seguinte circuito ZKP:\n{}\n\nRestrições:\n{}\n\nAlvo de otimização: {:?}\n\nOtimizações similares:\n{}", 
                    request.circuit,
                    serde_json::to_string_pretty(&request.constraints).unwrap(),
                    request.optimization_target,
                    similar_optimizations.join("\n")
                ),
                "stream": false
            }))
            .send()
            .await?
            .json::<serde_json::Value>()
            .await?;

        let optimized_circuit = ollama_response["response"].as_str()
            .ok_or_else(|| ZkpOptimizationError::OptimizationError("Resposta inválida do Ollama".to_string()))?
            .to_string();

        // Calcular métricas de performance
        let metrics = self.calculate_performance_metrics(&optimized_circuit)?;

        let response = ZkpOptimizationResponse {
            optimized_circuit,
            performance_metrics: metrics,
            recommendations: vec![
                "Considere reduzir o número de restrições".to_string(),
                "Use técnicas de batching para melhor performance".to_string(),
            ],
        };

        // Armazenar no cache
        redis::cmd("SETEX")
            .arg(&cache_key)
            .arg(300) // TTL de 5 minutos
            .arg(serde_json::to_string(&response)
                .map_err(|e| ZkpOptimizationError::OptimizationError(e.to_string()))?)
            .query_async::<_, ()>(&mut redis_conn)
            .await?;

        Ok(response)
    }

    async fn search_similar_optimizations(&self, request: &ZkpOptimizationRequest) -> Result<Vec<String>, ZkpOptimizationError> {
        let response = self.elasticsearch_client
            .search(elasticsearch::SearchParts::Index(&["zkp_optimizations"]))
            .body(json!({
                "query": {
                    "bool": {
                        "should": [
                            { "match": { "circuit_type": request.circuit }},
                            { "match": { "optimization_target": format!("{:?}", request.optimization_target) }},
                            { "range": { "constraint_count": { 
                                "gte": request.constraints.len() as i32 - 5,
                                "lte": request.constraints.len() as i32 + 5
                            }}}
                        ]
                    }
                },
                "size": 5
            }))
            .send()
            .await
            .map_err(|e| ZkpOptimizationError::ElasticsearchError(e.to_string()))?;

        let response_body = response
            .json::<serde_json::Value>()
            .await
            .map_err(|e| ZkpOptimizationError::ElasticsearchError(e.to_string()))?;

        Ok(response_body["hits"]["hits"]
            .as_array()
            .unwrap_or(&Vec::new())
            .iter()
            .filter_map(|hit| hit["_source"]["optimization"].as_str())
            .map(String::from)
            .collect())
    }

    fn calculate_performance_metrics(&self, circuit: &str) -> Result<PerformanceMetrics, ZkpOptimizationError> {
        // TODO: Implementar cálculo real de métricas
        Ok(PerformanceMetrics {
            proof_generation_time: 0.5,
            verification_time: 0.1,
            circuit_size: circuit.len(),
            constraint_count: circuit.matches("constraint").count(),
        })
    }
} 