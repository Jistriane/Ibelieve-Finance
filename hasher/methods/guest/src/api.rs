use actix_web::{web, App, HttpServer, HttpResponse, Responder};

pub async fn post_solvencia() -> impl Responder {
    // TODO: Receber dados, iniciar fluxo IA -> ZKP -> Blockchain
    HttpResponse::Ok().body("Solicitação recebida e em processamento")
}

pub async fn get_status(_id: web::Path<String>) -> impl Responder {
    // TODO: Consultar status no cache
    HttpResponse::Ok().body("Status da solicitação")
}

pub async fn get_prova(_id: web::Path<String>) -> impl Responder {
    // TODO: Retornar detalhes da prova
    HttpResponse::Ok().body("Detalhes da prova")
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::resource("/api/solvencia").route(web::post().to(post_solvencia))
    )
    .service(
        web::resource("/api/status/{id}").route(web::get().to(get_status))
    )
    .service(
        web::resource("/api/prova/{id}").route(web::get().to(get_prova))
    );
} 