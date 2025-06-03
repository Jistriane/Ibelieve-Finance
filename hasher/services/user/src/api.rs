use actix_web::{get, post, put, web, HttpResponse, Responder};
use chrono::Utc;
use log::{error, info};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;
use utoipa::OpenApi;

use crate::models::{User, ErrorResponse};
use crate::services::UserService;

#[derive(OpenApi)]
#[openapi(
    paths(
        get_user,
        create_user,
        update_user
    ),
    components(
        schemas(User)
    ),
    tags(
        (name = "users", description = "API de gerenciamento de usuários")
    )
)]
pub struct UserApi;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateUserRequest {
    pub wallet_address: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateUserRequest {
    pub wallet_address: String,
}

/// Obtém informações de um usuário
#[utoipa::path(
    get,
    path = "/{user_id}",
    params(
        ("user_id" = Uuid, Path, description = "ID do usuário")
    ),
    responses(
        (status = 200, description = "Usuário encontrado com sucesso", body = User),
        (status = 404, description = "Usuário não encontrado", body = ErrorResponse),
        (status = 500, description = "Erro interno do servidor", body = ErrorResponse)
    ),
    tag = "users"
)]
#[get("/{user_id}")]
pub async fn get_user(
    user_id: web::Path<Uuid>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    info!("Recebida requisição para buscar usuário: {}", user_id);

    let service = UserService::new(pool.get_ref());
    match service.get_user(*user_id).await {
        Ok(Some(user)) => HttpResponse::Ok().json(user),
        Ok(None) => {
            HttpResponse::NotFound().json(ErrorResponse {
                error: "not_found".to_string(),
                message: "Usuário não encontrado".to_string(),
            })
        }
        Err(e) => {
            error!("Erro ao buscar usuário: {}", e);
            HttpResponse::InternalServerError().json(ErrorResponse {
                error: "internal_server_error".to_string(),
                message: format!("Erro ao buscar usuário: {}", e),
            })
        }
    }
}

/// Cria um novo usuário
#[utoipa::path(
    post,
    path = "/",
    request_body = CreateUserRequest,
    responses(
        (status = 201, description = "Usuário criado com sucesso", body = User),
        (status = 400, description = "Dados inválidos", body = ErrorResponse),
        (status = 500, description = "Erro interno do servidor", body = ErrorResponse)
    ),
    tag = "users"
)]
#[post("")]
pub async fn create_user(
    request: web::Json<CreateUserRequest>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    info!("Recebida requisição para criar usuário");

    let user = User {
        id: Uuid::new_v4(),
        wallet_address: request.wallet_address.clone(),
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    let service = UserService::new(pool.get_ref());
    match service.create_user(user).await {
        Ok(created_user) => HttpResponse::Created().json(created_user),
        Err(e) => {
            error!("Erro ao criar usuário: {}", e);
            HttpResponse::InternalServerError().json(ErrorResponse {
                error: "internal_server_error".to_string(),
                message: format!("Erro ao criar usuário: {}", e),
            })
        }
    }
}

/// Atualiza um usuário existente
#[utoipa::path(
    put,
    path = "/{user_id}",
    params(
        ("user_id" = Uuid, Path, description = "ID do usuário")
    ),
    request_body = UpdateUserRequest,
    responses(
        (status = 200, description = "Usuário atualizado com sucesso", body = User),
        (status = 400, description = "Dados inválidos", body = ErrorResponse),
        (status = 404, description = "Usuário não encontrado", body = ErrorResponse),
        (status = 500, description = "Erro interno do servidor", body = ErrorResponse)
    ),
    tag = "users"
)]
#[put("/{user_id}")]
pub async fn update_user(
    user_id: web::Path<Uuid>,
    request: web::Json<UpdateUserRequest>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    info!("Recebida requisição para atualizar usuário: {}", user_id);

    let service = UserService::new(pool.get_ref());
    match service.update_user(*user_id, request.wallet_address.clone()).await {
        Ok(Some(updated_user)) => HttpResponse::Ok().json(updated_user),
        Ok(None) => {
            HttpResponse::NotFound().json(ErrorResponse {
                error: "not_found".to_string(),
                message: "Usuário não encontrado".to_string(),
            })
        }
        Err(e) => {
            error!("Erro ao atualizar usuário: {}", e);
            HttpResponse::InternalServerError().json(ErrorResponse {
                error: "internal_server_error".to_string(),
                message: format!("Erro ao atualizar usuário: {}", e),
            })
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::test;
    use sqlx::postgres::PgPoolOptions;

    async fn create_test_pool() -> PgPool {
        PgPoolOptions::new()
            .max_connections(5)
            .connect("postgres://postgres:postgres@localhost/test_db")
            .await
            .expect("Failed to create test pool")
    }

    #[actix_rt::test]
    async fn test_create_user() {
        let pool = create_test_pool().await;
        let app = test::init_service(
            App::new()
                .app_data(web::Data::new(pool.clone()))
                .service(create_user),
        )
        .await;

        let req = test::TestRequest::post()
            .uri("/")
            .set_json(&CreateUserRequest {
                wallet_address: "0x123...".to_string(),
            })
            .to_request();

        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());
    }
} 