use actix_web::{web, App, HttpServer, HttpResponse};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;
use handlers::auth::{login_tradicional, get_nonce, authenticate_wallet};
use common::{AuthRequest, AuthResponse, ErrorResponse};

mod handlers;

#[derive(OpenApi)]
#[openapi(
    paths(
        handlers::auth::login_tradicional,
        handlers::auth::get_nonce,
        handlers::auth::authenticate_wallet
    ),
    components(
        schemas(AuthRequest, AuthResponse, ErrorResponse)
    ),
    tags(
        (name = "auth", description = "API de autenticação")
    )
)]
struct ApiDoc;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(move || {
        App::new()
            .service(
                SwaggerUi::new("/swagger-ui/{_:.*}")
                    .url("/api-docs/openapi.json", ApiDoc::openapi())
            )
            .route("/api/auth/login", web::post().to(login_tradicional))
            .route("/api/auth/nonce", web::get().to(get_nonce))
            .route("/api/auth/authenticate", web::post().to(authenticate_wallet))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
} 