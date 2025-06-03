pub mod api;
pub mod models;
pub mod services;

use actix_web::{web, App, HttpServer};
use sqlx::PgPool;
use std::error::Error;
use common::{register_metrics, AuthMiddleware, ResilienceMiddleware};

pub async fn run_server(database_url: &str, port: u16) -> Result<(), Box<dyn Error>> {
    // Registrar métricas
    register_metrics();

    // Configurar pool de conexões
    let pool = common::db::setup_database(database_url).await?;
    let pool = web::Data::new(pool);

    // Obter chave secreta do ambiente
    let secret = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "default_secret_key".to_string())
        .into_bytes();

    // Iniciar servidor HTTP
    HttpServer::new(move || {
        App::new()
            .wrap(AuthMiddleware::new(&secret))
            .wrap(ResilienceMiddleware::new(100, 150)) // 100 req/s com burst de 150
            .app_data(pool.clone())
            .service(
                web::scope("/api/v1/ai")
                    .service(api::analyze_risk)
                    .service(api::get_analysis)
            )
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await?;

    Ok(())
} 