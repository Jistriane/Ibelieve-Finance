use actix_web::{web, App, HttpServer, HttpResponse, middleware};
use actix_cors::Cors;
use common::{ZKPProof, ErrorResponse};
use serde_json::json;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;
use utoipa::ToSchema;

#[derive(OpenApi)]
#[openapi(
    paths(
        generate_proof,
        verify_proof
    ),
    components(
        schemas(ZKPProof, ErrorResponse)
    ),
    tags(
        (name = "zkp", description = "API de Zero Knowledge Proofs")
    )
)]
struct ApiDoc;

#[utoipa::path(
    post,
    path = "/api/zkp/generate",
    request_body = ZKPProof,
    responses(
        (status = 200, description = "Prova gerada com sucesso", body = ZKPProof),
        (status = 400, description = "Erro na requisição", body = ErrorResponse),
        (status = 500, description = "Erro interno", body = ErrorResponse)
    )
)]
async fn generate_proof(proof_request: web::Json<ZKPProof>) -> HttpResponse {
    // TODO: Implementar geração de prova ZKP
    HttpResponse::Ok().json(json!({
        "proof": "zkp_proof_here",
        "public_inputs": ["input1", "input2"],
        "verification_key": "verification_key_here"
    }))
}

#[utoipa::path(
    post,
    path = "/api/zkp/verify",
    request_body = ZKPProof,
    responses(
        (status = 200, description = "Prova verificada com sucesso", body = bool),
        (status = 400, description = "Erro na requisição", body = ErrorResponse),
        (status = 500, description = "Erro interno", body = ErrorResponse)
    )
)]
async fn verify_proof(proof: web::Json<ZKPProof>) -> HttpResponse {
    // TODO: Implementar verificação de prova ZKP
    HttpResponse::Ok().json(json!({
        "verified": true
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
                web::scope("/api/zkp")
                    .service(generate_proof)
                    .service(verify_proof)
            )
    })
    .bind("127.0.0.1:8082")?
    .run()
    .await
} 