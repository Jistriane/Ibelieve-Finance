use actix_web::{get, post, web, HttpResponse, Responder};
use common::models::{AiAnalysis, ErrorResponse, User};
use log::{error, info};
use sqlx::PgPool;
use uuid::Uuid;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use crate::services::AiService;
use crate::{
    chat::routes as chat_routes,
    risk_analysis::routes as risk_routes,
    zkp_optimization::routes as zkp_routes,
    fraud_detection::routes as fraud_routes,
};

#[derive(Debug, serde::Deserialize)]
pub struct AnalyzeRiskRequest {
    pub user_id: Uuid,
}

/// Analisa o risco de um usuário
#[utoipa::path(
    post,
    path = "/analyze",
    request_body = AnalyzeRiskRequest,
    responses(
        (status = 201, description = "Análise criada com sucesso", body = AiAnalysis),
        (status = 404, description = "Usuário não encontrado", body = ErrorResponse),
        (status = 500, description = "Erro interno do servidor", body = ErrorResponse)
    ),
    tag = "ai"
)]
#[post("/analyze")]
pub async fn analyze_risk(
    request: web::Json<AnalyzeRiskRequest>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    info!("Recebida requisição para análise de risco do usuário: {}", request.user_id);

    // Buscar usuário
    let user = match sqlx::query_as!(
        User,
        "SELECT * FROM users WHERE id = $1",
        request.user_id
    )
    .fetch_optional(pool.get_ref())
    .await {
        Ok(Some(user)) => user,
        Ok(None) => {
            return HttpResponse::NotFound().json(ErrorResponse {
                error: "not_found".to_string(),
                message: "Usuário não encontrado".to_string(),
            })
        }
        Err(e) => {
            error!("Erro ao buscar usuário: {}", e);
            return HttpResponse::InternalServerError().json(ErrorResponse {
                error: "internal_server_error".to_string(),
                message: format!("Erro ao buscar usuário: {}", e),
            });
        }
    };

    // Criar serviço de IA
    let ollama_url = std::env::var("OLLAMA_API_URL")
        .unwrap_or_else(|_| "http://localhost:11434".to_string());
    let model = std::env::var("OLLAMA_MODEL")
        .unwrap_or_else(|_| "mistral".to_string());
    let service = AiService::new(pool.get_ref(), ollama_url, model);

    // Analisar risco
    match service.analyze_risk(&user).await {
        Ok(analysis) => HttpResponse::Created().json(analysis),
        Err(e) => {
            error!("Erro ao analisar risco: {}", e);
            HttpResponse::InternalServerError().json(ErrorResponse {
                error: "internal_server_error".to_string(),
                message: format!("Erro ao analisar risco: {}", e),
            })
        }
    }
}

/// Obtém uma análise de risco
#[utoipa::path(
    get,
    path = "/{analysis_id}",
    params(
        ("analysis_id" = Uuid, Path, description = "ID da análise")
    ),
    responses(
        (status = 200, description = "Análise encontrada com sucesso", body = AiAnalysis),
        (status = 404, description = "Análise não encontrada", body = ErrorResponse),
        (status = 500, description = "Erro interno do servidor", body = ErrorResponse)
    ),
    tag = "ai"
)]
#[get("/{analysis_id}")]
pub async fn get_analysis(
    analysis_id: web::Path<Uuid>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    info!("Recebida requisição para buscar análise: {}", analysis_id);

    let ollama_url = std::env::var("OLLAMA_API_URL")
        .unwrap_or_else(|_| "http://localhost:11434".to_string());
    let model = std::env::var("OLLAMA_MODEL")
        .unwrap_or_else(|_| "mistral".to_string());
    let service = AiService::new(pool.get_ref(), ollama_url, model);

    match service.get_analysis(*analysis_id).await {
        Ok(Some(analysis)) => HttpResponse::Ok().json(analysis),
        Ok(None) => {
            HttpResponse::NotFound().json(ErrorResponse {
                error: "not_found".to_string(),
                message: "Análise não encontrada".to_string(),
            })
        }
        Err(e) => {
            error!("Erro ao buscar análise: {}", e);
            HttpResponse::InternalServerError().json(ErrorResponse {
                error: "internal_server_error".to_string(),
                message: format!("Erro ao buscar análise: {}", e),
            })
        }
    }
}

#[derive(OpenApi)]
#[openapi(
    paths(
        chat_routes::chat,
        risk_routes::analyze_risk,
        zkp_routes::optimize,
        fraud_routes::detect
    ),
    components(
        schemas(
            chat_routes::ChatRequest,
            chat_routes::ChatResponse,
            risk_routes::RiskAnalysisRequest,
            risk_routes::RiskAnalysisResponse,
            zkp_routes::ZkpOptimizationRequest,
            zkp_routes::ZkpOptimizationResponse,
            fraud_routes::FraudDetectionRequest,
            fraud_routes::FraudDetectionResponse
        )
    ),
    tags(
        (name = "chat", description = "API de chat interativo"),
        (name = "risk", description = "API de análise de risco"),
        (name = "zkp", description = "API de otimização de ZKP"),
        (name = "fraud", description = "API de detecção de fraude")
    )
)]
struct ApiDoc;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/ai")
            .service(chat_routes::chat)
            .service(risk_routes::analyze_risk)
            .service(zkp_routes::optimize)
            .service(fraud_routes::detect)
    )
    .service(
        SwaggerUi::new("/swagger-ui/{_:.*}")
            .url("/api-docs/openapi.json", ApiDoc::openapi())
    );
} 