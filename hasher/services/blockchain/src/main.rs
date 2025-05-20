use actix_web::{web, App, HttpServer, HttpResponse, middleware};
use actix_cors::Cors;
use common::{BlockchainVerification, ErrorResponse};
use serde_json::json;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;
use utoipa::ToSchema;

#[derive(OpenApi)]
#[openapi(
    paths(
        verify_assets,
        verify_transaction
    ),
    components(
        schemas(BlockchainVerification, ErrorResponse)
    ),
    tags(
        (name = "blockchain", description = "API de Verificação Blockchain")
    )
)]
struct ApiDoc;

#[utoipa::path(
    post,
    path = "/api/blockchain/verify-assets",
    request_body = BlockchainVerification,
    responses(
        (status = 200, description = "Verificação realizada com sucesso", body = BlockchainVerification),
        (status = 400, description = "Erro na requisição", body = ErrorResponse),
        (status = 500, description = "Erro interno", body = ErrorResponse)
    )
)]
async fn verify_assets(verification_request: web::Json<BlockchainVerification>) -> HttpResponse {
    // TODO: Implementar verificação de ativos na blockchain
    HttpResponse::Ok().json(json!({
        "verified": true,
        "timestamp": "2024-03-24T12:00:00Z",
        "transaction_hash": "0x123..."
    }))
}

#[utoipa::path(
    get,
    path = "/api/blockchain/verify-transaction/{tx_hash}",
    params(
        ("tx_hash" = String, Path, description = "Hash da transação")
    ),
    responses(
        (status = 200, description = "Verificação realizada com sucesso", body = BlockchainVerification),
        (status = 400, description = "Erro na requisição", body = ErrorResponse),
        (status = 500, description = "Erro interno", body = ErrorResponse)
    )
)]
async fn verify_transaction(tx_hash: web::Path<String>) -> HttpResponse {
    // TODO: Implementar verificação de transação na blockchain
    HttpResponse::Ok().json(json!({
        "verified": true,
        "timestamp": "2024-03-24T12:00:00Z",
        "transaction_hash": tx_hash.into_inner()
    }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    
    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();

        App::new()
            .wrap(cors)
            .wrap(middleware::Logger::default())
            .service(
                SwaggerUi::new("/swagger-ui/{_:.*}")
                    .url("/api-docs/openapi.json", ApiDoc::openapi())
            )
            .service(
                web::scope("/api/blockchain")
                    .service(verify_assets)
                    .service(verify_transaction)
            )
    })
    .bind("127.0.0.1:8084")?
    .run()
    .await
} 