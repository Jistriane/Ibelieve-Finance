use actix_web::{web, HttpResponse};
use serde::{Deserialize, Serialize};
use utoipa::OpenApi;
use common::{AuthRequest, AuthResponse, ErrorResponse};
use chrono::{DateTime, Utc};

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[utoipa::path(
    post,
    path = "/login",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "Login bem sucedido", body = AuthResponse),
        (status = 400, description = "Erro na requisição", body = ErrorResponse),
        (status = 401, description = "Credenciais inválidas", body = ErrorResponse)
    )
)]
pub async fn login_tradicional(login: web::Json<LoginRequest>) -> HttpResponse {
    // TODO: Implementar autenticação real
    HttpResponse::Ok().json(AuthResponse {
        token: "jwt_token_aqui".to_string(),
        expires_at: Utc::now(),
    })
}

#[utoipa::path(
    get,
    path = "/nonce",
    params(
        ("wallet_address" = String, Query, description = "Endereço da carteira")
    ),
    responses(
        (status = 200, description = "Nonce gerado", body = String),
        (status = 400, description = "Erro na requisição", body = ErrorResponse)
    )
)]
pub async fn get_nonce(wallet_address: web::Query<String>) -> HttpResponse {
    // TODO: Implementar geração real de nonce
    HttpResponse::Ok().json(serde_json::json!({
        "nonce": "random_nonce_aqui"
    }))
}

#[utoipa::path(
    post,
    path = "/authenticate",
    request_body = AuthRequest,
    responses(
        (status = 200, description = "Autenticação bem sucedida", body = AuthResponse),
        (status = 400, description = "Erro na requisição", body = ErrorResponse),
        (status = 401, description = "Autenticação falhou", body = ErrorResponse)
    )
)]
pub async fn authenticate_wallet(auth_request: web::Json<AuthRequest>) -> HttpResponse {
    // TODO: Implementar autenticação via carteira
    HttpResponse::Ok().json(AuthResponse {
        token: "jwt_token_wallet".to_string(),
        expires_at: Utc::now(),
    })
} 