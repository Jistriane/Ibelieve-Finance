mod chat;
mod risk_analysis;
mod zkp_optimization;
mod fraud_detection;
mod config;
mod api;

use actix_web::{web, App, HttpServer};
use common::{
    middleware::{AuthMiddleware, ResilienceMiddleware},
    tracing::TracingMiddleware,
};
use config::Config;
use common::health::{HealthRegistry, DatabaseHealthChecker, OllamaHealthChecker, HealthCheckerConfig};
use common::metrics::register_metrics;
use sqlx::PgPool;
use std::env;
use std::time::Duration;
use log::info;

mod handlers;
mod services;

use handlers::{analyze_risk, get_analysis, health_check, liveness, readiness};
use services::AiService;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Carregar configuração
    let config = Config::from_env().expect("Falha ao carregar configuração");

    // Inicializar tracing
    common::tracing::init_tracing(common::tracing::TracingConfig {
        service_name: "ai-service".to_string(),
        otlp_endpoint: config.jaeger_endpoint.clone(),
        log_level: "info".to_string(),
        sample_ratio: 1.0,
    })
    .expect("Falha ao inicializar tracing");

    // Registrar métricas
    common::metrics::register_metrics();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let ollama_url = env::var("OLLAMA_API_URL").expect("OLLAMA_API_URL must be set");
    let ollama_model = env::var("OLLAMA_MODEL").unwrap_or_else(|_| "mistral".to_string());

    let pool = PgPool::connect(&database_url)
        .await
        .expect("Failed to connect to Postgres");

    let ai_service = web::Data::new(AiService::new(&pool, ollama_url.clone(), ollama_model));

    // Configurar health checkers com configuração personalizada
    let health_config = HealthCheckerConfig {
        timeout: Duration::from_secs(5),
        interval: Duration::from_secs(30),
        service_name: "ai".to_string(),
        retry_attempts: 3,
    };

    let health_registry = web::Data::new(HealthRegistry::new(health_config));
    
    health_registry
        .register(
            "database".to_string(),
            DatabaseHealthChecker::new(pool.clone()),
        )
        .await;
    
    health_registry
        .register(
            "ollama".to_string(),
            OllamaHealthChecker::new(ollama_url),
        )
        .await;

    info!("Iniciando servidor AI na porta {}", config.port);

    HttpServer::new(move || {
        App::new()
            .wrap(TracingMiddleware)
            .wrap(AuthMiddleware::new())
            .wrap(ResilienceMiddleware::new())
            .app_data(ai_service.clone())
            .app_data(health_registry.clone())
            .service(
                web::scope("/api/v1")
                    .service(analyze_risk)
                    .service(get_analysis)
            )
            .service(health_check)
            .service(liveness)
            .service(readiness)
    })
    .bind(("0.0.0.0", config.port))?
    .run()
    .await
} 