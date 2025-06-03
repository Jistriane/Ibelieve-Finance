use sqlx::postgres::PgPoolOptions;
use tokio;
use uuid::Uuid;

// Módulos de teste
mod ai_blockchain_tests;
mod blockchain_zkp_tests;
mod ai_zkp_tests;

// Configuração compartilhada para testes
pub async fn setup_test_db() -> sqlx::PgPool {
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect("postgres://ibeleve:ibeleve@localhost:5432/ibeleve_test")
        .await
        .expect("Falha ao criar pool de teste");

    // Limpar todas as tabelas
    sqlx::query!("TRUNCATE TABLE users CASCADE").execute(&pool).await.unwrap();
    sqlx::query!("TRUNCATE TABLE blockchain_verifications CASCADE").execute(&pool).await.unwrap();
    sqlx::query!("TRUNCATE TABLE zkp_proofs CASCADE").execute(&pool).await.unwrap();
    sqlx::query!("TRUNCATE TABLE ai_analyses CASCADE").execute(&pool).await.unwrap();

    pool
}

// Configurações compartilhadas
pub struct TestConfig {
    pub db_pool: sqlx::PgPool,
    pub ollama_url: String,
    pub blockchain_rpc: String,
}

impl TestConfig {
    pub async fn new() -> Self {
        Self {
            db_pool: setup_test_db().await,
            ollama_url: "http://localhost:11434".to_string(),
            blockchain_rpc: "http://localhost:8545".to_string(),
        }
    }
}

// Helpers para testes
pub async fn create_test_user(pool: &sqlx::PgPool) -> (Uuid, String) {
    let user_id = Uuid::new_v4();
    let wallet_address = format!("0x{}", hex::encode(user_id.as_bytes()));

    sqlx::query!(
        r#"
        INSERT INTO users (id, wallet_address, created_at, updated_at)
        VALUES ($1, $2, NOW(), NOW())
        "#,
        user_id,
        wallet_address,
    )
    .execute(pool)
    .await
    .expect("Falha ao criar usuário de teste");

    (user_id, wallet_address)
} 