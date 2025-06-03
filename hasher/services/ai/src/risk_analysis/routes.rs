use actix_web::{post, web, HttpResponse, Result};
use super::{RiskAnalysisRequest, RiskAnalysisResponse, RiskAnalysisService};

/// Análise de risco automatizada
#[utoipa::path(
    post,
    path = "/api/ai/risk/analyze",
    request_body = RiskAnalysisRequest,
    responses(
        (status = 200, description = "Análise de risco bem sucedida", body = RiskAnalysisResponse),
        (status = 400, description = "Requisição inválida"),
        (status = 500, description = "Erro interno do servidor")
    ),
    tags("risk")
)]
#[post("/risk/analyze")]
pub async fn analyze_risk(
    request: web::Json<RiskAnalysisRequest>,
    service: web::Data<RiskAnalysisService>,
) -> Result<HttpResponse> {
    let response = service.analyze_risk(request.into_inner()).await?;
    Ok(HttpResponse::Ok().json(response))
} 