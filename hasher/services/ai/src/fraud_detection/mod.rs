mod routes;
mod service;

pub use routes::*;
pub use service::*;

use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct FraudDetectionRequest {
    pub transaction_data: TransactionData,
    pub user_profile: UserProfile,
    pub device_info: DeviceInfo,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct FraudDetectionResponse {
    pub is_fraudulent: bool,
    pub confidence_score: f32,
    pub fraud_indicators: Vec<FraudIndicator>,
    pub recommended_actions: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct TransactionData {
    pub amount: f64,
    pub currency: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub merchant: String,
    pub payment_method: String,
    pub location: Option<Location>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct UserProfile {
    pub user_id: String,
    pub account_age_days: u32,
    pub typical_transaction_amount: f64,
    pub typical_locations: Vec<Location>,
    pub risk_score: f32,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct DeviceInfo {
    pub device_id: String,
    pub ip_address: String,
    pub user_agent: String,
    pub is_known_device: bool,
    pub location: Option<Location>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct Location {
    pub latitude: f64,
    pub longitude: f64,
    pub country: String,
    pub city: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct FraudIndicator {
    pub indicator_type: FraudIndicatorType,
    pub severity: Severity,
    pub description: String,
    pub confidence: f32,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub enum FraudIndicatorType {
    UnusualLocation,
    UnusualAmount,
    UnusualDevice,
    UnusualTime,
    VelocityCheck,
    BlacklistedIP,
    SuspiciousBehavior,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub enum Severity {
    Low,
    Medium,
    High,
    Critical,
} 