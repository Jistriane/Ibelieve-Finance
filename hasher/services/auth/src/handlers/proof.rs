use actix_web::{web, HttpResponse};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct ProofRequest {
    pub financial_data: serde_json::Value,
}

#[derive(Deserialize)]
pub struct SubmitProofRequest {
    pub proof: serde_json::Value,
}

pub async fn generate_proof(_req: web::Json<ProofRequest>) -> HttpResponse {
    // TODO: Chamar stub do ZKP Engine
    HttpResponse::Ok().json(serde_json::json!({
        "proof": { "zkp": "zkp_stub" },
        "status": "pending"
    }))
}

pub async fn submit_proof(_req: web::Json<SubmitProofRequest>) -> HttpResponse {
    // TODO: Chamar stub do Smart Contract
    HttpResponse::Ok().json(serde_json::json!({
        "status": "submitted"
    }))
}

pub async fn proof_status(_user_id: web::Query<String>) -> HttpResponse {
    // TODO: Consultar status real
    HttpResponse::Ok().json(serde_json::json!({
        "status": "approved",
        "details": {}
    }))
} 