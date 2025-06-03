use common::models::{BlockchainVerification, User, VerificationStatus};
use ethers::providers::{Http, Provider};
use sqlx::PgPool;
use std::error::Error;
use uuid::Uuid;
use chrono::Utc;

pub struct BlockchainService {
    pool: PgPool,
    provider: Provider<Http>,
}

impl BlockchainService {
    pub fn new(pool: &PgPool, rpc_url: &str) -> Result<Self, Box<dyn Error>> {
        let provider = Provider::<Http>::try_from(rpc_url)?;
        
        Ok(Self {
            pool: pool.clone(),
            provider,
        })
    }

    pub async fn verify_transaction(&self, user: &User, tx_hash: &str) -> Result<BlockchainVerification, Box<dyn Error>> {
        // Verificar se a transação existe
        let tx = self.provider.get_transaction(tx_hash.parse()?).await?;

        // Criar verificação
        let verification = BlockchainVerification {
            id: Uuid::new_v4(),
            user_id: user.id,
            transaction_hash: tx_hash.to_string(),
            status: match tx {
                Some(_) => VerificationStatus::Verified,
                None => VerificationStatus::Invalid,
            },
            verified_at: Utc::now(),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        // Salvar verificação no banco
        sqlx::query!(
            "INSERT INTO blockchain_verifications (id, user_id, transaction_hash, status, verified_at, created_at, updated_at) \
            VALUES ($1, $2, $3, $4, $5, $6, $7)",
            verification.id,
            verification.user_id,
            verification.transaction_hash,
            verification.status as _,
            verification.verified_at,
            verification.created_at,
            verification.updated_at
        )
        .execute(&self.pool)
        .await?;

        Ok(verification)
    }

    pub async fn get_verification(&self, verification_id: Uuid) -> Result<Option<BlockchainVerification>, Box<dyn Error>> {
        let verification = sqlx::query_as!(
            BlockchainVerification,
            "SELECT * FROM blockchain_verifications WHERE id = $1",
            verification_id
        )
        .fetch_optional(&self.pool)
        .await?;

        Ok(verification)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use mockall::predicate::*;
    use mockall::*;

    mock! {
        Provider {
            fn get_transaction(&self, hash: String) -> Result<Option<Transaction>, Box<dyn Error>>;
        }
    }

    #[tokio::test]
    async fn test_verify_transaction() {
        // TODO: Implementar testes
    }
} 