use super::{ChatRequest, ChatResponse};
use actix_web::web;
use elasticsearch::Elasticsearch;
use redis::Client as RedisClient;
use reqwest::Client;
use std::sync::Arc;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ChatError {
    #[error("Erro ao processar chat: {0}")]
    ProcessError(String),
    #[error("Erro no Ollama: {0}")]
    OllamaError(#[from] reqwest::Error),
    #[error("Erro no Redis: {0}")]
    RedisError(#[from] redis::RedisError),
    #[error("Erro no Elasticsearch: {0}")]
    ElasticsearchError(String),
}

impl actix_web::error::ResponseError for ChatError {}

pub struct ChatService {
    ollama_client: Client,
    redis_client: RedisClient,
    elasticsearch_client: Arc<Elasticsearch>,
    config: crate::config::Config,
}

impl ChatService {
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

    pub async fn process_chat(&self, request: ChatRequest) -> Result<ChatResponse, ChatError> {
        // Verificar cache Redis
        let cache_key = format!("chat:{}", request.message);
        let mut redis_conn = self.redis_client.get_async_connection().await?;
        
        if let Ok(cached) = redis::cmd("GET")
            .arg(&cache_key)
            .query_async::<_, String>(&mut redis_conn)
            .await
        {
            return Ok(serde_json::from_str(&cached)
                .map_err(|e| ChatError::ProcessError(e.to_string()))?);
        }

        // Buscar contexto no Elasticsearch
        let context = self.search_context(&request.message).await?;

        // Processar com Ollama
        let ollama_response = self.ollama_client
            .post(&format!("{}/api/generate", self.config.ollama_url))
            .json(&serde_json::json!({
                "model": self.config.ollama_model,
                "prompt": format!(
                    "Contexto: {}\nPergunta: {}", 
                    context.join("\n"), 
                    request.message
                ),
                "stream": false
            }))
            .send()
            .await?
            .json::<serde_json::Value>()
            .await?;

        let response = ChatResponse {
            response: ollama_response["response"].as_str()
                .ok_or_else(|| ChatError::ProcessError("Resposta inválida do Ollama".to_string()))?
                .to_string(),
            confidence: 0.95, // TODO: Implementar cálculo de confiança
            sources: context,
        };

        // Armazenar no cache
        redis::cmd("SETEX")
            .arg(&cache_key)
            .arg(300) // TTL de 5 minutos
            .arg(serde_json::to_string(&response)
                .map_err(|e| ChatError::ProcessError(e.to_string()))?)
            .query_async::<_, ()>(&mut redis_conn)
            .await?;

        Ok(response)
    }

    async fn search_context(&self, query: &str) -> Result<Vec<String>, ChatError> {
        let response = self.elasticsearch_client
            .search(elasticsearch::SearchParts::Index(&["financial_docs"]))
            .body(json!({
                "query": {
                    "multi_match": {
                        "query": query,
                        "fields": ["content", "title"],
                        "fuzziness": "AUTO"
                    }
                },
                "size": 5
            }))
            .send()
            .await
            .map_err(|e| ChatError::ElasticsearchError(e.to_string()))?;

        let response_body = response
            .json::<serde_json::Value>()
            .await
            .map_err(|e| ChatError::ElasticsearchError(e.to_string()))?;

        Ok(response_body["hits"]["hits"]
            .as_array()
            .unwrap_or(&Vec::new())
            .iter()
            .filter_map(|hit| hit["_source"]["content"].as_str())
            .map(String::from)
            .collect())
    }
} 