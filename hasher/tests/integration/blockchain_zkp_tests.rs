use super::*;
use crate::services::{
    blockchain::{BlockchainService, VerifyTransactionRequest},
    zkp::{ZKPService, GenerateProofRequest, VerifyProofRequest},
};

#[tokio::test]
async fn test_blockchain_verification_with_zkp() {
    let config = TestConfig::new().await;
    let blockchain_service = BlockchainService::new(config.blockchain_rpc, config.db_pool.clone())
        .expect("Falha ao criar serviço blockchain");
    let zkp_service = ZKPService::new(config.db_pool.clone());

    // Primeiro verificar transação na blockchain
    let tx_request = VerifyTransactionRequest {
        transaction_hash: "0x123...".to_string(),
    };

    let verification = blockchain_service
        .verify_assets(&tx_request)
        .await
        .expect("Falha ao verificar ativos");

    assert!(verification.verified);

    // Gerar prova ZKP da verificação
    let proof_request = GenerateProofRequest {
        public_inputs: vec![
            verification.transaction_hash.unwrap(),
            verification.verified.to_string(),
        ],
    };

    let proof = zkp_service
        .generate_proof(proof_request)
        .await
        .expect("Falha ao gerar prova");

    // Verificar a prova
    let verify_request = VerifyProofRequest {
        proof: proof.proof,
        public_inputs: proof.public_inputs,
        verification_key: proof.verification_key,
    };

    let is_valid = zkp_service
        .verify_proof(&verify_request)
        .await
        .expect("Falha ao verificar prova");

    assert!(is_valid);

    // Verificar se os dados foram salvos corretamente
    let saved_verification = sqlx::query!(
        r#"
        SELECT * FROM blockchain_verifications 
        WHERE transaction_hash = $1
        "#,
        tx_request.transaction_hash
    )
    .fetch_one(&config.db_pool)
    .await
    .expect("Falha ao buscar verificação salva");

    let saved_proof = sqlx::query!(
        r#"
        SELECT * FROM zkp_proofs 
        WHERE id = $1
        "#,
        proof.id
    )
    .fetch_one(&config.db_pool)
    .await
    .expect("Falha ao buscar prova salva");

    assert_eq!(saved_verification.verified, verification.verified);
    assert_eq!(saved_proof.id, proof.id);
}

#[tokio::test]
async fn test_multiple_verifications_with_zkp() {
    let config = TestConfig::new().await;
    let blockchain_service = BlockchainService::new(config.blockchain_rpc, config.db_pool.clone())
        .expect("Falha ao criar serviço blockchain");
    let zkp_service = ZKPService::new(config.db_pool.clone());

    let tx_hashes = vec!["0x123...", "0x456...", "0x789..."];
    let mut proofs = Vec::new();

    // Verificar múltiplas transações e gerar provas
    for tx_hash in tx_hashes {
        let tx_request = VerifyTransactionRequest {
            transaction_hash: tx_hash.to_string(),
        };

        let verification = blockchain_service
            .verify_assets(&tx_request)
            .await
            .expect("Falha ao verificar ativos");

        let proof_request = GenerateProofRequest {
            public_inputs: vec![
                verification.transaction_hash.unwrap(),
                verification.verified.to_string(),
            ],
        };

        let proof = zkp_service
            .generate_proof(proof_request)
            .await
            .expect("Falha ao gerar prova");

        proofs.push(proof);
    }

    // Verificar todas as provas
    for proof in proofs {
        let verify_request = VerifyProofRequest {
            proof: proof.proof,
            public_inputs: proof.public_inputs,
            verification_key: proof.verification_key,
        };

        let is_valid = zkp_service
            .verify_proof(&verify_request)
            .await
            .expect("Falha ao verificar prova");

        assert!(is_valid);
    }

    // Verificar contagem de registros
    let verification_count = sqlx::query!(
        r#"
        SELECT COUNT(*) as count FROM blockchain_verifications
        "#
    )
    .fetch_one(&config.db_pool)
    .await
    .expect("Falha ao contar verificações")
    .count
    .unwrap();

    let proof_count = sqlx::query!(
        r#"
        SELECT COUNT(*) as count FROM zkp_proofs
        "#
    )
    .fetch_one(&config.db_pool)
    .await
    .expect("Falha ao contar provas")
    .count
    .unwrap();

    assert_eq!(verification_count as usize, tx_hashes.len());
    assert_eq!(proof_count as usize, tx_hashes.len());
}

#[tokio::test]
async fn test_failed_verification_with_zkp() {
    let config = TestConfig::new().await;
    let blockchain_service = BlockchainService::new(config.blockchain_rpc, config.db_pool.clone())
        .expect("Falha ao criar serviço blockchain");
    let zkp_service = ZKPService::new(config.db_pool.clone());

    // Tentar verificar transação inválida
    let tx_request = VerifyTransactionRequest {
        transaction_hash: "invalid_hash".to_string(),
    };

    let verification_result = blockchain_service.verify_assets(&tx_request).await;
    assert!(verification_result.is_err());

    // Tentar gerar prova com dados inválidos
    let proof_request = GenerateProofRequest {
        public_inputs: vec!["invalid_hash".to_string(), "false".to_string()],
    };

    let proof_result = zkp_service.generate_proof(proof_request).await;
    assert!(proof_result.is_err());
} 