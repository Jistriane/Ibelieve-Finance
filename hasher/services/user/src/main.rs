use actix_web::{web, App, HttpServer, HttpResponse, middleware};
use actix_cors::Cors;
use common::{User, ErrorResponse};
use serde_json::json;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;
use utoipa::ToSchema;

#[derive(OpenApi)]
#[openapi(
    paths(
        get_user,
        create_user,
        update_user
    ),
    components(
        schemas(User, ErrorResponse)
    ),
    tags(
        (name = "user", description = "API de Gerenciamento de Usuários")
    )
)]
struct ApiDoc;

#[utoipa::path(
    get,
    path = "/api/users/{user_id}",
    params(
        ("user_id" = String, Path, description = "ID do usuário")
    ),
    responses(
        (status = 200, description = "Usuário encontrado", body = User),
        (status = 404, description = "Usuário não encontrado", body = ErrorResponse),
        (status = 500, description = "Erro interno", body = ErrorResponse)
    )
)]
async fn get_user(user_id: web::Path<String>) -> HttpResponse {
    // TODO: Implementar busca de usuário
    HttpResponse::Ok().json(json!({
        "id": user_id.into_inner(),
        "wallet_address": "0x123...",
        "created_at": "2024-03-24T12:00:00Z",
        "updated_at": "2024-03-24T12:00:00Z"
    }))
}

#[utoipa::path(
    post,
    path = "/api/users",
    request_body = User,
    responses(
        (status = 201, description = "Usuário criado com sucesso", body = User),
        (status = 400, description = "Erro na requisição", body = ErrorResponse),
        (status = 500, description = "Erro interno", body = ErrorResponse)
    )
)]
async fn create_user(user: web::Json<User>) -> HttpResponse {
    // TODO: Implementar criação de usuário
    HttpResponse::Created().json(user.into_inner())
}

#[utoipa::path(
    put,
    path = "/api/users/{user_id}",
    params(
        ("user_id" = String, Path, description = "ID do usuário")
    ),
    request_body = User,
    responses(
        (status = 200, description = "Usuário atualizado com sucesso", body = User),
        (status = 400, description = "Erro na requisição", body = ErrorResponse),
        (status = 404, description = "Usuário não encontrado", body = ErrorResponse),
        (status = 500, description = "Erro interno", body = ErrorResponse)
    )
)]
async fn update_user(user_id: web::Path<String>, user: web::Json<User>) -> HttpResponse {
    // TODO: Implementar atualização de usuário
    HttpResponse::Ok().json(user.into_inner())
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
                web::scope("/api/users")
                    .service(get_user)
                    .service(create_user)
                    .service(update_user)
            )
    })
    .bind("127.0.0.1:8085")?
    .run()
    .await
} 