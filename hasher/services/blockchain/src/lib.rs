pub mod api;
pub mod models;
pub mod services;

use actix_web::{web, App, HttpServer};
use sqlx::PgPool;
use std::error::Error;

pub async fn run_server(database_url: &str, port: u16) -> Result<(), Box<dyn Error>> {
    let pool = common::db::setup_database(database_url).await?;
    let pool = web::Data::new(pool);

    HttpServer::new(move || {
        App::new()
            .app_data(pool.clone())
            .service(
                web::scope("/api/v1/blockchain")
                    .service(api::verify_transaction)
                    .service(api::get_verification)
            )
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await?;

    Ok(())
} 