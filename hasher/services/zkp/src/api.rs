use actix_web::{get, post, web, HttpResponse, Responder};
use common::models::{ZkpProof, ErrorResponse, User};
use log::{error, info};
use sqlx::PgPool;
use uuid::Uuid;

use crate::services::ZkpService;

#[derive(Debug, serde::Deserialize)]
pub struct GenerateProofRequest {
    pub user_id: Uuid,
}

/// Gera uma prova de conhecimento zero
#[utoipa::path(
    post,
    path = "/generate",
    request_body = GenerateProofRequest,
    responses(
        (status = 201, description = "Prova gerada com sucesso", body = ZkpProof),
        (status = 404, description = "Usuário não encontrado", body = ErrorResponse),
        (status = 500, description = "Erro interno do servidor", body = ErrorResponse)
    ),
    tag = "zkp"
)]
#[post("/generate")]
pub async fn generate_proof(
    request: web::Json<GenerateProofRequest>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    info!("Recebida requisição para gerar prova para usuário: {}", request.user_id);

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

    // Criar serviço ZKP
    let service = ZkpService::new(pool.get_ref());

    // Gerar prova
    match service.generate_proof(&user).await {
        Ok(proof) => HttpResponse::Created().json(proof),
        Err(e) => {
            error!("Erro ao gerar prova: {}", e);
            HttpResponse::InternalServerError().json(ErrorResponse {
                error: "internal_server_error".to_string(),
                message: format!("Erro ao gerar prova: {}", e),
            })
        }
    }
}

/// Obtém uma prova de conhecimento zero
#[utoipa::path(
    get,
    path = "/{proof_id}",
    params(
        ("proof_id" = Uuid, Path, description = "ID da prova")
    ),
    responses(
        (status = 200, description = "Prova encontrada com sucesso", body = ZkpProof),
        (status = 404, description = "Prova não encontrada", body = ErrorResponse),
        (status = 500, description = "Erro interno do servidor", body = ErrorResponse)
    ),
    tag = "zkp"
)]
#[get("/{proof_id}")]
pub async fn get_proof(
    proof_id: web::Path<Uuid>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    info!("Recebida requisição para buscar prova: {}", proof_id);

    let service = ZkpService::new(pool.get_ref());

    match service.get_proof(*proof_id).await {
        Ok(Some(proof)) => HttpResponse::Ok().json(proof),
        Ok(None) => {
            HttpResponse::NotFound().json(ErrorResponse {
                error: "not_found".to_string(),
                message: "Prova não encontrada".to_string(),
            })
        }
        Err(e) => {
            error!("Erro ao buscar prova: {}", e);
            HttpResponse::InternalServerError().json(ErrorResponse {
                error: "internal_server_error".to_string(),
                message: format!("Erro ao buscar prova: {}", e),
            })
        }
    }
} 