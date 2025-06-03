use actix_web::{post, web, HttpResponse, Result};
use super::{ZkpOptimizationRequest, ZkpOptimizationResponse, ZkpOptimizationService};

/// Otimização de provas ZKP
#[utoipa::path(
    post,
    path = "/api/ai/zkp/optimize",
    request_body = ZkpOptimizationRequest,
    responses(
        (status = 200, description = "Otimização bem sucedida", body = ZkpOptimizationResponse),
        (status = 400, description = "Requisição inválida"),
        (status = 500, description = "Erro interno do servidor")
    ),
    tags("zkp")
)]
#[post("/zkp/optimize")]
pub async fn optimize(
    request: web::Json<ZkpOptimizationRequest>,
    service: web::Data<ZkpOptimizationService>,
) -> Result<HttpResponse> {
    let response = service.optimize_circuit(request.into_inner()).await?;
    Ok(HttpResponse::Ok().json(response))
} 