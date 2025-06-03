use actix_web::{get, post, web, HttpResponse, Responder};
use chrono::{DateTime, Utc};
use log::{error, info};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use utoipa::OpenApi;
use sqlx::PgPool;

use crate::models::{
    BlockchainVerification, ErrorResponse, VerifyAssetsRequest, VerifyAssetsResponse,
    VerifyTransactionRequest, VerifyTransactionResponse,
};
use crate::services::BlockchainService;
use common::models::{BlockchainVerification, ErrorResponse, User};

#[derive(OpenApi)]
#[openapi(
    paths(
        verify_assets,
        verify_transaction,
        get_verification
    ),
    components(
        schemas(BlockchainVerification)
    ),
    tags(
        (name = "blockchain", description = "API de verificação blockchain")
    )
)]
pub struct BlockchainApi;

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifyAssetsRequest {
    pub verified: bool,
    pub timestamp: DateTime<Utc>,
    pub transaction_hash: Option<String>,
}

/// Verifica ativos na blockchain
#[utoipa::path(
    post,
    path = "/verify-assets",
    request_body = VerifyAssetsRequest,
    responses(
        (status = 200, description = "Ativos verificados com sucesso", body = VerifyAssetsResponse),
        (status = 400, description = "Requisição inválida", body = ErrorResponse),
        (status = 500, description = "Erro interno do servidor", body = ErrorResponse)
    ),
    tag = "blockchain"
)]
#[post("/verify-assets")]
pub async fn verify_assets(
    request: web::Json<VerifyAssetsRequest>,
    service: web::Data<BlockchainService>,
) -> impl Responder {
    info!("Recebida requisição para verificar ativos: {:?}", request);

    let verification = BlockchainVerification {
        id: Uuid::new_v4(),
        verified: request.verified,
        timestamp: request.timestamp,
        transaction_hash: request.transaction_hash.clone(),
        created_at: Utc::now(),
    };

    match service.verify_assets(verification).await {
        Ok(result) => HttpResponse::Ok().json(result),
        Err(e) => {
            error!("Erro ao verificar ativos: {}", e);
            HttpResponse::InternalServerError().json(ErrorResponse {
                error: "internal_server_error".to_string(),
                message: format!("Erro ao verificar ativos: {}", e),
            })
        }
    }
}

#[derive(Debug, serde::Deserialize)]
pub struct VerifyTransactionRequest {
    pub user_id: Uuid,
    pub transaction_hash: String,
}

/// Verifica uma transação na blockchain
#[utoipa::path(
    post,
    path = "/verify",
    request_body = VerifyTransactionRequest,
    responses(
        (status = 201, description = "Verificação criada com sucesso", body = BlockchainVerification),
        (status = 404, description = "Usuário não encontrado", body = ErrorResponse),
        (status = 500, description = "Erro interno do servidor", body = ErrorResponse)
    ),
    tag = "blockchain"
)]
#[post("/verify")]
pub async fn verify_transaction(
    request: web::Json<VerifyTransactionRequest>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    info!("Recebida requisição para verificar transação: {}", request.transaction_hash);

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

    // Criar serviço de blockchain
    let rpc_url = std::env::var("ETHEREUM_RPC_URL")
        .expect("ETHEREUM_RPC_URL deve estar definida");
    let service = match BlockchainService::new(pool.get_ref(), &rpc_url) {
        Ok(service) => service,
        Err(e) => {
            error!("Erro ao criar serviço de blockchain: {}", e);
            return HttpResponse::InternalServerError().json(ErrorResponse {
                error: "internal_server_error".to_string(),
                message: format!("Erro ao criar serviço de blockchain: {}", e),
            });
        }
    };

    // Verificar transação
    match service.verify_transaction(&user, &request.transaction_hash).await {
        Ok(verification) => HttpResponse::Created().json(verification),
        Err(e) => {
            error!("Erro ao verificar transação: {}", e);
            HttpResponse::InternalServerError().json(ErrorResponse {
                error: "internal_server_error".to_string(),
                message: format!("Erro ao verificar transação: {}", e),
            })
        }
    }
}

/// Obtém uma verificação de transação
#[utoipa::path(
    get,
    path = "/{verification_id}",
    params(
        ("verification_id" = Uuid, Path, description = "ID da verificação")
    ),
    responses(
        (status = 200, description = "Verificação encontrada com sucesso", body = BlockchainVerification),
        (status = 404, description = "Verificação não encontrada", body = ErrorResponse),
        (status = 500, description = "Erro interno do servidor", body = ErrorResponse)
    ),
    tag = "blockchain"
)]
#[get("/{verification_id}")]
pub async fn get_verification(
    verification_id: web::Path<Uuid>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    info!("Recebida requisição para buscar verificação: {}", verification_id);

    let rpc_url = std::env::var("ETHEREUM_RPC_URL")
        .expect("ETHEREUM_RPC_URL deve estar definida");
    let service = match BlockchainService::new(pool.get_ref(), &rpc_url) {
        Ok(service) => service,
        Err(e) => {
            error!("Erro ao criar serviço de blockchain: {}", e);
            return HttpResponse::InternalServerError().json(ErrorResponse {
                error: "internal_server_error".to_string(),
                message: format!("Erro ao criar serviço de blockchain: {}", e),
            });
        }
    };

    match service.get_verification(*verification_id).await {
        Ok(Some(verification)) => HttpResponse::Ok().json(verification),
        Ok(None) => {
            HttpResponse::NotFound().json(ErrorResponse {
                error: "not_found".to_string(),
                message: "Verificação não encontrada".to_string(),
            })
        }
        Err(e) => {
            error!("Erro ao buscar verificação: {}", e);
            HttpResponse::InternalServerError().json(ErrorResponse {
                error: "internal_server_error".to_string(),
                message: format!("Erro ao buscar verificação: {}", e),
            })
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::test;

    #[actix_rt::test]
    async fn test_verify_assets() {
        let app = test::init_service(
            actix_web::App::new().service(verify_assets),
        )
        .await;

        let req = test::TestRequest::post()
            .uri("/verify-assets")
            .set_json(&VerifyAssetsRequest {
                verified: true,
                timestamp: Utc::now(),
                transaction_hash: Some("0x123...".to_string()),
            })
            .to_request();

        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());
    }

    #[actix_rt::test]
    async fn test_verify_transaction() {
        let app = test::init_service(
            actix_web::App::new().service(verify_transaction),
        )
        .await;

        let req = test::TestRequest::post()
            .uri("/verify")
            .set_json(&VerifyTransactionRequest {
                tx_hash: "0x123...".to_string(),
            })
            .to_request();

        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());
    }
} 