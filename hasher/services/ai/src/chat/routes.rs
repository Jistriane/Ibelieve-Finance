use actix_web::{post, web, HttpResponse, Result};
use super::{ChatRequest, ChatResponse, ChatService};

/// Chat interativo para dúvidas sobre finanças
#[utoipa::path(
    post,
    path = "/api/ai/chat",
    request_body = ChatRequest,
    responses(
        (status = 200, description = "Chat bem sucedido", body = ChatResponse),
        (status = 400, description = "Requisição inválida"),
        (status = 500, description = "Erro interno do servidor")
    ),
    tags("chat")
)]
#[post("/chat")]
pub async fn chat(
    request: web::Json<ChatRequest>,
    service: web::Data<ChatService>,
) -> Result<HttpResponse> {
    let response = service.process_chat(request.into_inner()).await?;
    Ok(HttpResponse::Ok().json(response))
} 