use actix_web::{web, App, HttpServer, HttpResponse, middleware};
use actix_cors::Cors;
use common::{SolvencyRequest, SolvencyResponse, ErrorResponse};
use serde_json::json;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;
use utoipa::ToSchema;

#[derive(OpenApi)]
#[openapi(
    paths(
        request_solvency,
        get_solvency_status
    ),
    components(
        schemas(SolvencyRequest, SolvencyResponse, ErrorResponse)
    ),
    tags(
        (name = "solvency", description = "API de Solvência")
    )
)]
struct ApiDoc;

#[utoipa::path(
    post,
    path = "/api/solvency/request",
    request_body = SolvencyRequest,
    responses(
        (status = 202, description = "Solicitação aceita", body = SolvencyResponse),
        (status = 400, description = "Erro na requisição", body = ErrorResponse),
        (status = 500, description = "Erro interno", body = ErrorResponse)
    )
)]
async fn request_solvency(request: web::Json<SolvencyRequest>) -> HttpResponse {
    // TODO: Implementar orquestração da solicitação de solvência
    HttpResponse::Accepted().json(json!({
        "request_id": "uuid_here",
        "status": "Pending",
        "created_at": "2024-03-24T12:00:00Z"
    }))
}

#[utoipa::path(
    get,
    path = "/api/solvency/{request_id}",
    params(
        ("request_id" = String, Path, description = "ID da solicitação")
    ),
    responses(
        (status = 200, description = "Status da solicitação", body = SolvencyResponse),
        (status = 404, description = "Solicitação não encontrada", body = ErrorResponse),
        (status = 500, description = "Erro interno", body = ErrorResponse)
    )
)]
async fn get_solvency_status(request_id: web::Path<String>) -> HttpResponse {
    // TODO: Implementar consulta de status da solicitação
    HttpResponse::Ok().json(json!({
        "request_id": request_id.into_inner(),
        "status": "Completed",
        "proof": "zkp_proof_here",
        "score": 0.85,
        "created_at": "2024-03-24T12:00:00Z"
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
                web::scope("/api/solvency")
                    .service(request_solvency)
                    .service(get_solvency_status)
            )
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
} 