use actix_web::{get, web, HttpResponse};
use common::health::{HealthRegistry, HealthStatus};
use serde_json::json;

#[get("/health")]
pub async fn health_check(registry: web::Data<HealthRegistry>) -> HttpResponse {
    let results = registry.check_all().await;
    let all_healthy = registry.is_healthy().await;

    let status = if all_healthy {
        HealthStatus::Up
    } else {
        HealthStatus::Down
    };

    let response = json!({
        "status": status,
        "checks": results,
        "timestamp": chrono::Utc::now()
    });

    if all_healthy {
        HttpResponse::Ok().json(response)
    } else {
        HttpResponse::ServiceUnavailable().json(response)
    }
}

#[get("/health/live")]
pub async fn liveness() -> HttpResponse {
    HttpResponse::Ok().json(json!({
        "status": "up",
        "timestamp": chrono::Utc::now()
    }))
}

#[get("/health/ready")]
pub async fn readiness(registry: web::Data<HealthRegistry>) -> HttpResponse {
    let is_ready = registry.is_healthy().await;

    let response = json!({
        "status": if is_ready { "ready" } else { "not_ready" },
        "timestamp": chrono::Utc::now()
    });

    if is_ready {
        HttpResponse::Ok().json(response)
    } else {
        HttpResponse::ServiceUnavailable().json(response)
    }
} 