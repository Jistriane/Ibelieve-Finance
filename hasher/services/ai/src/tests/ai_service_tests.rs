use super::*;
use mockall::predicate::*;
use sqlx::postgres::PgPoolOptions;
use tokio;
use uuid::Uuid;
use serde_json::json;

async fn setup_test_db() -> PgPool {
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect("postgres://ibeleve:ibeleve@localhost:5432/ibeleve_test")
        .await
        .expect("Falha ao criar pool de teste");

    // Limpar tabelas de teste
    sqlx::query!("TRUNCATE TABLE ai_analyses CASCADE")
        .execute(&pool)
        .await
        .expect("Falha ao limpar tabela de análises");

    pool
}

#[tokio::test]
async fn test_analyze_risk_success() {
    let pool = setup_test_db().await;
    let ollama_url = "http://localhost:11434".to_string();
    let service = AIService::new(pool.clone(), ollama_url);

    let user_id = Uuid::new_v4();
    let request = AnalysisRequest {
        user_id,
        wallet_address: "0x123...".to_string(),
    };

    let result = service.analyze_risk(request).await;
    assert!(result.is_ok());

    let analysis = result.unwrap();
    assert_eq!(analysis.user_id, user_id);
    assert!(analysis.score >= 0.0 && analysis.score <= 100.0);
    assert!(analysis.confidence >= 0.0 && analysis.confidence <= 1.0);
    assert!(!analysis.factors.is_empty());

    // Verificar se foi salvo no banco
    let saved = sqlx::query!(
        "SELECT * FROM ai_analyses WHERE user_id = $1",
        user_id
    )
    .fetch_one(&pool)
    .await
    .expect("Falha ao buscar análise salva");

    assert_eq!(saved.user_id, user_id);
    assert_eq!(saved.score, analysis.score);
    assert_eq!(saved.confidence, analysis.confidence);
}

#[tokio::test]
async fn test_get_analysis_existing() {
    let pool = setup_test_db().await;
    let ollama_url = "http://localhost:11434".to_string();
    let service = AIService::new(pool.clone(), ollama_url);

    let user_id = Uuid::new_v4();
    let factors = vec!["Fator 1".to_string(), "Fator 2".to_string()];

    // Inserir análise de teste
    sqlx::query!(
        r#"
        INSERT INTO ai_analyses (id, user_id, score, confidence, factors, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        "#,
        Uuid::new_v4(),
        user_id,
        75.0,
        0.85,
        json!(factors),
        Utc::now()
    )
    .execute(&pool)
    .await
    .expect("Falha ao inserir análise de teste");

    let result = service.get_analysis(user_id).await;
    assert!(result.is_ok());

    let analysis = result.unwrap().expect("Análise deveria existir");
    assert_eq!(analysis.user_id, user_id);
    assert_eq!(analysis.score, 75.0);
    assert_eq!(analysis.confidence, 0.85);
    assert_eq!(analysis.factors, factors);
}

#[tokio::test]
async fn test_get_analysis_nonexistent() {
    let pool = setup_test_db().await;
    let ollama_url = "http://localhost:11434".to_string();
    let service = AIService::new(pool.clone(), ollama_url);

    let result = service.get_analysis(Uuid::new_v4()).await;
    assert!(result.is_ok());
    assert!(result.unwrap().is_none());
}

#[tokio::test]
async fn test_analyze_risk_invalid_wallet() {
    let pool = setup_test_db().await;
    let ollama_url = "http://localhost:11434".to_string();
    let service = AIService::new(pool.clone(), ollama_url);

    let request = AnalysisRequest {
        user_id: Uuid::new_v4(),
        wallet_address: "invalid_wallet".to_string(),
    };

    let result = service.analyze_risk(request).await;
    assert!(result.is_err());
}

#[tokio::test]
async fn test_analyze_risk_ollama_error() {
    let pool = setup_test_db().await;
    let ollama_url = "http://invalid-url:11434".to_string();
    let service = AIService::new(pool.clone(), ollama_url);

    let request = AnalysisRequest {
        user_id: Uuid::new_v4(),
        wallet_address: "0x123...".to_string(),
    };

    let result = service.analyze_risk(request).await;
    assert!(result.is_err());
} 