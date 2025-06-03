use blockchain_service::run_server;
use env_logger::Env;
use log::info;
use std::env;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Inicializar logger
    env_logger::init_from_env(Env::default().default_filter_or("info"));

    // Carregar variáveis de ambiente
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL deve estar definida");
    let port = env::var("BLOCKCHAIN_SERVICE_PORT")
        .unwrap_or_else(|_| "3001".to_string())
        .parse::<u16>()
        .expect("BLOCKCHAIN_SERVICE_PORT deve ser um número válido");

    info!("Iniciando serviço de Blockchain na porta {}", port);

    // Iniciar servidor
    run_server(&database_url, port)
        .await
        .expect("Erro ao iniciar servidor");

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::test;

    #[actix_rt::test]
    async fn test_health_check() {
        let app = test::init_service(
            App::new().service(web::scope("/api/blockchain")),
        )
        .await;

        let req = test::TestRequest::get().uri("/api/blockchain/health").to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());
    }
} 