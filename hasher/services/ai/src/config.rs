use serde::Deserialize;
use std::env;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("Erro ao carregar variável de ambiente: {0}")]
    EnvError(#[from] env::VarError),
}

#[derive(Clone, Debug, Deserialize)]
pub struct Config {
    pub port: u16,
    pub database_url: String,
    pub redis_url: String,
    pub elasticsearch_url: String,
    pub ollama_url: String,
    pub ollama_model: String,
    pub jaeger_endpoint: String,
}

impl Config {
    pub fn from_env() -> Result<Self, ConfigError> {
        Ok(Config {
            port: env::var("AI_SERVICE_PORT")
                .unwrap_or_else(|_| "8086".to_string())
                .parse()
                .unwrap_or(8086),
            database_url: env::var("DATABASE_URL")?,
            redis_url: env::var("REDIS_URL")
                .unwrap_or_else(|_| "redis://localhost:6379".to_string()),
            elasticsearch_url: env::var("ELASTICSEARCH_URL")
                .unwrap_or_else(|_| "http://localhost:9200".to_string()),
            ollama_url: env::var("OLLAMA_URL")
                .unwrap_or_else(|_| "http://localhost:11434".to_string()),
            ollama_model: env::var("OLLAMA_MODEL")
                .unwrap_or_else(|_| "gemma:2b".to_string()),
            jaeger_endpoint: env::var("JAEGER_ENDPOINT")
                .unwrap_or_else(|_| "http://localhost:4317".to_string()),
        })
    }
} 