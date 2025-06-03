use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct BlockchainVerification {
    #[schema(example = "123e4567-e89b-12d3-a456-426614174000")]
    pub id: Uuid,
    #[schema(example = "0x123...")]
    pub transaction_hash: Option<String>,
    #[schema(example = true)]
    pub verified: bool,
    pub timestamp: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifyAssetsRequest {
    pub verified: bool,
    pub timestamp: DateTime<Utc>,
    pub transaction_hash: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifyAssetsResponse {
    pub verified: bool,
    pub timestamp: DateTime<Utc>,
    pub transaction_hash: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifyTransactionRequest {
    pub transaction_hash: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifyTransactionResponse {
    pub verified: bool,
    pub timestamp: DateTime<Utc>,
    pub transaction_hash: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub error: String,
    pub message: String,
}

impl BlockchainVerification {
    pub fn new(transaction_hash: Option<String>, verified: bool) -> Self {
        Self {
            id: Uuid::new_v4(),
            verified,
            timestamp: Utc::now(),
            transaction_hash,
            created_at: Utc::now(),
        }
    }
} 