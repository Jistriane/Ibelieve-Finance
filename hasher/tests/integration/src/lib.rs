pub mod ai_blockchain_tests;
pub mod blockchain_zkp_tests;
pub mod ai_zkp_tests;

use sqlx::postgres::PgPoolOptions;
use tokio;
use uuid::Uuid;
use common::models::{User, AiAnalysis, BlockchainVerification, ZkpProof};
use reqwest::Client;
use std::error::Error;

// Configuração compartilhada para testes
pub async fn setup_test_db() -> sqlx::PgPool {
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect("postgres://postgres:postgres@localhost:5432/test_db")
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

pub struct TestClient {
    http: Client,
    pool: sqlx::PgPool,
    ai_url: String,
    blockchain_url: String,
    zkp_url: String,
}

impl TestClient {
    pub async fn new(database_url: &str) -> Result<Self, Box<dyn Error>> {
        let pool = common::db::setup_test_database(database_url).await?;
        
        Ok(Self {
            http: Client::new(),
            pool,
            ai_url: "http://localhost:3000".to_string(),
            blockchain_url: "http://localhost:3001".to_string(),
            zkp_url: "http://localhost:3002".to_string(),
        })
    }

    pub async fn create_user(&self, wallet_address: &str) -> Result<User, Box<dyn Error>> {
        let response = self.http
            .post(&format!("{}/api/v1/users", self.ai_url))
            .json(&serde_json::json!({
                "wallet_address": wallet_address
            }))
            .send()
            .await?;

        let user = response.json::<User>().await?;
        Ok(user)
    }

    pub async fn analyze_risk(&self, user_id: Uuid) -> Result<AiAnalysis, Box<dyn Error>> {
        let response = self.http
            .post(&format!("{}/api/v1/ai/analyze", self.ai_url))
            .json(&serde_json::json!({
                "user_id": user_id
            }))
            .send()
            .await?;

        let analysis = response.json::<AiAnalysis>().await?;
        Ok(analysis)
    }

    pub async fn verify_transaction(&self, user_id: Uuid, tx_hash: &str) -> Result<BlockchainVerification, Box<dyn Error>> {
        let response = self.http
            .post(&format!("{}/api/v1/blockchain/verify", self.blockchain_url))
            .json(&serde_json::json!({
                "user_id": user_id,
                "transaction_hash": tx_hash
            }))
            .send()
            .await?;

        let verification = response.json::<BlockchainVerification>().await?;
        Ok(verification)
    }

    pub async fn generate_proof(&self, user_id: Uuid) -> Result<ZkpProof, Box<dyn Error>> {
        let response = self.http
            .post(&format!("{}/api/v1/zkp/generate", self.zkp_url))
            .json(&serde_json::json!({
                "user_id": user_id
            }))
            .send()
            .await?;

        let proof = response.json::<ZkpProof>().await?;
        Ok(proof)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use test_log::test;

    #[test(tokio::test)]
    async fn test_full_flow() -> Result<(), Box<dyn Error>> {
        let client = TestClient::new("postgres://postgres:postgres@localhost:5432/test_db").await?;

        // Criar usuário
        let user = client.create_user("0x123...").await?;
        assert!(!user.id.is_nil());

        // Analisar risco
        let analysis = client.analyze_risk(user.id).await?;
        assert!(analysis.risk_score >= 0.0 && analysis.risk_score <= 100.0);

        // Verificar transação
        let verification = client.verify_transaction(user.id, "0xabc...").await?;
        assert_eq!(verification.user_id, user.id);

        // Gerar prova
        let proof = client.generate_proof(user.id).await?;
        assert!(proof.verification_result);

        Ok(())
    }
} 