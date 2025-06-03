use sqlx::PgPool;
use std::error::Error;

pub async fn setup_database(database_url: &str) -> Result<PgPool, Box<dyn Error>> {
    let pool = PgPool::connect(database_url).await?;

    // Executar migrações
    sqlx::query!(
        include_str!("migrations/001_initial_schema.sql")
    )
    .execute(&pool)
    .await?;

    Ok(pool)
}

pub async fn setup_test_database(database_url: &str) -> Result<PgPool, Box<dyn Error>> {
    let pool = PgPool::connect(database_url).await?;

    // Limpar todas as tabelas
    sqlx::query!("TRUNCATE TABLE users CASCADE").execute(&pool).await?;
    sqlx::query!("TRUNCATE TABLE blockchain_verifications CASCADE").execute(&pool).await?;
    sqlx::query!("TRUNCATE TABLE zkp_proofs CASCADE").execute(&pool).await?;
    sqlx::query!("TRUNCATE TABLE ai_analyses CASCADE").execute(&pool).await?;

    Ok(pool)
} 