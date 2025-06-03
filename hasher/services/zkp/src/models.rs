use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct ZKProof {
    pub id: Uuid,
    pub proof: Vec<u8>,
    pub public_inputs: Vec<String>,
    pub verification_key: Vec<u8>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GenerateProofRequest {
    pub public_inputs: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifyProofRequest {
    pub proof: Vec<u8>,
    pub public_inputs: Vec<String>,
    pub verification_key: Vec<u8>,
} 