mod routes;
mod service;

pub use routes::*;
pub use service::*;

use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ZkpOptimizationRequest {
    pub circuit: String,
    pub constraints: Vec<Constraint>,
    pub optimization_target: OptimizationTarget,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ZkpOptimizationResponse {
    pub optimized_circuit: String,
    pub performance_metrics: PerformanceMetrics,
    pub recommendations: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct Constraint {
    pub name: String,
    pub expression: String,
    pub weight: f32,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct PerformanceMetrics {
    pub proof_generation_time: f64,
    pub verification_time: f64,
    pub circuit_size: usize,
    pub constraint_count: usize,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub enum OptimizationTarget {
    ProofSize,
    VerificationTime,
    ProverTime,
    CircuitSize,
} 