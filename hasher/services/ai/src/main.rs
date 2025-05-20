use actix_web::{web, App, HttpServer, HttpResponse, middleware};
use actix_cors::Cors;
use common::{AIAnalysis, ErrorResponse};
use serde_json::json;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;
use utoipa::ToSchema;

#[derive(OpenApi)]
#[openapi(
    paths(
        analyze_solvency
    ),
    components(
        schemas(AIAnalysis, ErrorResponse)
    ),
    tags(
        (name = "ai", description = "API de Análise de IA")
    )
)]
struct ApiDoc;

#[utoipa::path(
    post,
    path = "/api/ai/analyze",
    request_body = AIAnalysis,
    responses(
        (status = 200, description = "Análise realizada com sucesso", body = AIAnalysis),
        (status = 400, description = "Erro na requisição", body = ErrorResponse),
        (status = 500, description = "Erro interno", body = ErrorResponse)
    )
)]
async fn analyze_solvency(analysis_request: web::Json<AIAnalysis>) -> HttpResponse {
    // TODO: Implementar análise de solvência com IA
    HttpResponse::Ok().json(json!({
        "score": 0.85,
        "confidence": 0.92,
        "factors": [
            "Histórico de pagamentos",
            "Renda comprovada",
            "Patrimônio"
        ]
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
                web::scope("/api/ai")
                    .service(analyze_solvency)
            )
    })
    .bind("127.0.0.1:8083")?
    .run()
    .await
} 