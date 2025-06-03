use actix_web::{post, web, HttpResponse, Result};
use super::{FraudDetectionRequest, FraudDetectionResponse, FraudDetectionService};

/// Detecção de fraudes em tempo real
#[utoipa::path(
    post,
    path = "/api/ai/fraud/detect",
    request_body = FraudDetectionRequest,
    responses(
        (status = 200, description = "Detecção de fraude bem sucedida", body = FraudDetectionResponse),
        (status = 400, description = "Requisição inválida"),
        (status = 500, description = "Erro interno do servidor")
    ),
    tags("fraud")
)]
#[post("/fraud/detect")]
pub async fn detect(
    request: web::Json<FraudDetectionRequest>,
    service: web::Data<FraudDetectionService>,
) -> Result<HttpResponse> {
    let response = service.detect_fraud(request.into_inner()).await?;
    Ok(HttpResponse::Ok().json(response))
} 