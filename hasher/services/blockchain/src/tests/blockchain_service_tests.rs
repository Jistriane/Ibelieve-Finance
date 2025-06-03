use super::*;
use ethers::{
    types::{H256, TransactionReceipt, U64},
    providers::MockProvider,
};
use mockall::predicate::*;
use sqlx::postgres::PgPoolOptions;
use tokio;

async fn setup_test_db() -> PgPool {
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect("postgres://ibeleve:ibeleve@localhost:5432/ibeleve_test")
        .await
        .expect("Falha ao criar pool de teste");

    // Limpar tabelas de teste
    sqlx::query!("TRUNCATE TABLE blockchain_verifications CASCADE")
        .execute(&pool)
        .await
        .expect("Falha ao limpar tabela de verificações");

    pool
}

fn setup_mock_provider() -> MockProvider {
    let mut provider = MockProvider::new();
    provider
        .expect_get_transaction()
        .returning(|_| Ok(Some(Transaction::default())));
    provider
        .expect_get_transaction_receipt()
        .returning(|_| {
            let mut receipt = TransactionReceipt::default();
            receipt.status = Some(U64::from(1));
            Ok(Some(receipt))
        });
    provider
}

#[tokio::test]
async fn test_verify_assets_success() {
    let pool = setup_test_db().await;
    let provider = setup_mock_provider();
    let service = BlockchainService::new(provider, pool.clone());

    let request = VerifyTransactionRequest {
        transaction_hash: "0x123...".to_string(),
    };

    let result = service.verify_assets(&request).await;
    assert!(result.is_ok());

    let verification = result.unwrap();
    assert_eq!(verification.transaction_hash, Some(request.transaction_hash));
    assert!(verification.verified);

    // Verificar se foi salvo no banco
    let saved = sqlx::query!(
        "SELECT * FROM blockchain_verifications WHERE transaction_hash = $1",
        verification.transaction_hash
    )
    .fetch_one(&pool)
    .await
    .expect("Falha ao buscar verificação salva");

    assert_eq!(saved.transaction_hash, verification.transaction_hash);
    assert_eq!(saved.verified, verification.verified);
}

#[tokio::test]
async fn test_verify_transaction_cached() {
    let pool = setup_test_db().await;
    let provider = setup_mock_provider();
    let service = BlockchainService::new(provider, pool.clone());

    let tx_hash = "0x123...";
    let verification = BlockchainVerification {
        id: Uuid::new_v4(),
        transaction_hash: Some(tx_hash.to_string()),
        verified: true,
        timestamp: Utc::now(),
        created_at: Utc::now(),
    };

    // Inserir verificação de teste
    sqlx::query!(
        r#"
        INSERT INTO blockchain_verifications (id, transaction_hash, verified, timestamp, created_at)
        VALUES ($1, $2, $3, $4, $5)
        "#,
        verification.id,
        verification.transaction_hash,
        verification.verified,
        verification.timestamp,
        verification.created_at,
    )
    .execute(&pool)
    .await
    .expect("Falha ao inserir verificação de teste");

    let result = service.verify_transaction(tx_hash).await;
    assert!(result.is_ok());

    let found = result.unwrap().expect("Verificação deveria existir");
    assert_eq!(found.transaction_hash, verification.transaction_hash);
    assert_eq!(found.verified, verification.verified);
}

#[tokio::test]
async fn test_verify_transaction_not_found() {
    let pool = setup_test_db().await;
    let mut provider = MockProvider::new();
    provider
        .expect_get_transaction()
        .returning(|_| Ok(None));
    
    let service = BlockchainService::new(provider, pool.clone());

    let result = service.verify_transaction("0xnonexistent...").await;
    assert!(result.is_ok());
    assert!(result.unwrap().is_none());
}

#[tokio::test]
async fn test_get_transaction_details_success() {
    let pool = setup_test_db().await;
    let mut provider = MockProvider::new();
    let expected_tx = Transaction::default();
    
    provider
        .expect_get_transaction()
        .returning(move |_| Ok(Some(expected_tx.clone())));
    
    let service = BlockchainService::new(provider, pool);

    let result = service.get_transaction_details("0x123...").await;
    assert!(result.is_ok());
}

#[tokio::test]
async fn test_verify_assets_invalid_hash() {
    let pool = setup_test_db().await;
    let provider = setup_mock_provider();
    let service = BlockchainService::new(provider, pool);

    let request = VerifyTransactionRequest {
        transaction_hash: "invalid_hash".to_string(),
    };

    let result = service.verify_assets(&request).await;
    assert!(result.is_err());
} 