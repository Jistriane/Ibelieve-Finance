use actix_web::{web, App, HttpServer};
use dotenv::dotenv;
use log::info;
use sqlx::PgPool;
use std::env;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

mod api;
mod models;
mod services;
mod database;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Carregar variáveis de ambiente
    dotenv().ok();
    env_logger::init();

    // Configurar porta do servidor
    let port = env::var("USER_SERVICE_PORT")
        .unwrap_or_else(|_| "8085".to_string())
        .parse::<u16>()
        .expect("Porta inválida");

    // Conectar ao banco de dados
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL deve ser definida");
    
    let pool = PgPool::connect(&database_url)
        .await
        .expect("Falha ao conectar ao banco de dados");

    // Executar migrações
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Falha ao executar migrações");

    info!("Iniciando serviço de usuários na porta {}", port);

    // Iniciar servidor HTTP
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))
            .service(
                SwaggerUi::new("/swagger-ui/{_:.*}")
                    .url("/api-docs/openapi.json", api::UserApi::openapi()),
            )
            .service(web::scope("/api/users")
                .service(api::get_user)
                .service(api::create_user)
                .service(api::update_user))
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::test;

    #[actix_rt::test]
    async fn test_health_check() {
        let app = test::init_service(
            App::new().service(web::scope("/api/users")),
        )
        .await;

        let req = test::TestRequest::get().uri("/api/users/health").to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());
    }
} 
 