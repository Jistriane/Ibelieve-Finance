use std::sync::Arc;
use tokio::sync::Mutex;
use crate::models::BlockchainVerification;

#[derive(Clone)]
pub struct BlockchainService {
    verifications: Arc<Mutex<Vec<BlockchainVerification>>>,
}

impl BlockchainService {
    pub fn new() -> Self {
        Self {
            verifications: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub async fn verify_assets(&self, verification: BlockchainVerification) -> Result<BlockchainVerification, String> {
        let mut verifications = self.verifications.lock().await;
        
        // Aqui implementaríamos a lógica real de verificação blockchain
        // Por enquanto, apenas armazenamos a verificação
        verifications.push(verification.clone());
        
        Ok(verification)
    }

    pub async fn verify_transaction(&self, tx_hash: String) -> Result<Option<BlockchainVerification>, String> {
        let verifications = self.verifications.lock().await;
        
        // Buscar verificação pelo hash da transação
        let verification = verifications.iter()
            .find(|v| v.transaction_hash.as_ref() == Some(&tx_hash))
            .cloned();
            
        Ok(verification)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;
    use uuid::Uuid;

    #[tokio::test]
    async fn test_verify_assets() {
        let service = BlockchainService::new();
        let verification = BlockchainVerification {
            id: Uuid::new_v4(),
            verified: true,
            timestamp: Utc::now(),
            transaction_hash: Some("0x123".to_string()),
            created_at: Utc::now(),
        };

        let result = service.verify_assets(verification.clone()).await;
        assert!(result.is_ok());
        
        let saved = result.unwrap();
        assert_eq!(saved.transaction_hash, verification.transaction_hash);
        assert_eq!(saved.verified, verification.verified);
    }

    #[tokio::test]
    async fn test_verify_transaction() {
        let service = BlockchainService::new();
        let tx_hash = "0x123".to_string();
        let verification = BlockchainVerification {
            id: Uuid::new_v4(),
            verified: true,
            timestamp: Utc::now(),
            transaction_hash: Some(tx_hash.clone()),
            created_at: Utc::now(),
        };

        // Primeiro salvamos uma verificação
        let _ = service.verify_assets(verification.clone()).await;

        // Depois buscamos pelo hash
        let result = service.verify_transaction(tx_hash).await;
        assert!(result.is_ok());
        
        let found = result.unwrap();
        assert!(found.is_some());
        let found = found.unwrap();
        assert_eq!(found.transaction_hash, verification.transaction_hash);
    }
} 