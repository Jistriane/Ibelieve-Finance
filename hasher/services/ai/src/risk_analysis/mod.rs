mod routes;
mod service;

pub use routes::*;
pub use service::*;

use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct RiskAnalysisRequest {
    pub transaction_data: TransactionData,
    pub user_history: Option<Vec<TransactionData>>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct RiskAnalysisResponse {
    pub risk_score: f32,
    pub risk_factors: Vec<RiskFactor>,
    pub recommendations: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct TransactionData {
    pub amount: f64,
    pub currency: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub transaction_type: String,
    pub merchant: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct RiskFactor {
    pub factor: String,
    pub severity: RiskSeverity,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub enum RiskSeverity {
    Low,
    Medium,
    High,
    Critical,
} 