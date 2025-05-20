use config::{Config, ConfigError, Environment, File};
use serde::Deserialize;
use std::env;

#[derive(Debug, Deserialize)]
pub struct DatabaseConfig {
    pub url: String,
}

#[derive(Debug, Deserialize)]
pub struct RedisConfig {
    pub url: String,
}

#[derive(Debug, Deserialize)]
pub struct AuthConfig {
    pub jwt_secret: String,
    pub jwt_expiration: u64,
}

#[derive(Debug, Deserialize)]
pub struct BlockchainConfig {
    pub rpc_url: String,
    pub network: String,
}

#[derive(Debug, Deserialize)]
pub struct AIConfig {
    pub model_path: String,
    pub confidence_threshold: f64,
}

#[derive(Debug, Deserialize)]
pub struct ZKPConfig {
    pub verification_key_path: String,
    pub proving_key_path: String,
}

#[derive(Debug, Deserialize)]
pub struct LogConfig {
    pub level: String,
    pub backtrace: bool,
}

#[derive(Debug, Deserialize)]
pub struct ServiceConfig {
    pub api_gateway_port: u16,
    pub auth_service_port: u16,
    pub zkp_service_port: u16,
    pub ai_service_port: u16,
    pub blockchain_service_port: u16,
    pub user_service_port: u16,
}

#[derive(Debug, Deserialize)]
pub struct CORSConfig {
    pub allowed_origins: Vec<String>,
    pub allowed_methods: Vec<String>,
    pub allowed_headers: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct RateLimitConfig {
    pub requests: u32,
    pub duration: u64,
}

#[derive(Debug, Deserialize)]
pub struct CacheConfig {
    pub ttl: u64,
    pub prefix: String,
}

#[derive(Debug, Deserialize)]
pub struct SecurityConfig {
    pub encryption_key: String,
    pub hash_salt: String,
}

#[derive(Debug, Deserialize)]
pub struct MonitoringConfig {
    pub enable_metrics: bool,
    pub metrics_port: u16,
    pub enable_tracing: bool,
    pub tracing_service_name: String,
}

#[derive(Debug, Deserialize)]
pub struct Settings {
    pub database: DatabaseConfig,
    pub redis: RedisConfig,
    pub auth: AuthConfig,
    pub blockchain: BlockchainConfig,
    pub ai: AIConfig,
    pub zkp: ZKPConfig,
    pub log: LogConfig,
    pub service: ServiceConfig,
    pub cors: CORSConfig,
    pub rate_limit: RateLimitConfig,
    pub cache: CacheConfig,
    pub security: SecurityConfig,
    pub monitoring: MonitoringConfig,
}

impl Settings {
    pub fn new() -> Result<Self, ConfigError> {
        let env = env::var("RUN_ENV").unwrap_or_else(|_| "development".into());

        let s = Config::builder()
            .add_source(File::with_name("config/default"))
            .add_source(File::with_name(&format!("config/{}", env)).required(false))
            .add_source(Environment::with_prefix("IBELEVE"))
            .build()?;

        s.try_deserialize()
    }
} 