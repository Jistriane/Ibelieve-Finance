use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: Uuid,
    pub wallet_address: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct SolvencyRequest {
    #[validate(length(min = 42, max = 42))]
    pub wallet_address: String,
    pub document_hash: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SolvencyResponse {
    pub request_id: Uuid,
    pub status: SolvencyStatus,
    pub proof: Option<String>,
    pub score: Option<f64>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum SolvencyStatus {
    Pending,
    Processing,
    Completed,
    Failed,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ErrorResponse {
    pub code: String,
    pub message: String,
    pub details: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct AuthRequest {
    pub wallet_address: String,
    pub signature: String,
    pub nonce: String,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct AuthResponse {
    pub token: String,
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ZKPProof {
    pub proof: String,
    pub public_inputs: Vec<String>,
    pub verification_key: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIAnalysis {
    pub score: f64,
    pub confidence: f64,
    pub factors: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BlockchainVerification {
    pub verified: bool,
    pub timestamp: DateTime<Utc>,
    pub transaction_hash: Option<String>,
} 