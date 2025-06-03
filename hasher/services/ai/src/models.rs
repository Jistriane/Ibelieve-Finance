use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct AIAnalysis {
    pub id: Uuid,
    pub user_id: Uuid,
    pub score: f64,
    pub confidence: f64,
    pub factors: Vec<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalysisRequest {
    pub user_id: Uuid,
    pub wallet_address: String,
} 