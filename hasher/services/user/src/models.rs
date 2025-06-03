use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, ToSchema, sqlx::FromRow)]
pub struct User {
    #[schema(example = "123e4567-e89b-12d3-a456-426614174000")]
    pub id: Uuid,
    #[schema(example = "0x123...")]
    pub wallet_address: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub error: String,
    pub message: String,
}

impl User {
    pub fn new(wallet_address: String) -> Self {
        Self {
            id: Uuid::new_v4(),
            wallet_address,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }

    pub fn update_wallet_address(&mut self, wallet_address: String) {
        self.wallet_address = wallet_address;
        self.updated_at = Utc::now();
    }
} 