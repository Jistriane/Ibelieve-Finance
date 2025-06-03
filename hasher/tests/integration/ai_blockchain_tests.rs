use super::*;
use crate::services::{
    ai::{AIService, AnalysisRequest},
    blockchain::{BlockchainService, VerifyTransactionRequest},
};

#[tokio::test]
async fn test_risk_analysis_with_blockchain_verification() {
    let config = TestConfig::new().await;
    let ai_service = AIService::new(config.db_pool.clone(), config.ollama_url);
    let blockchain_service = BlockchainService::new(config.blockchain_rpc, config.db_pool.clone())
        .expect("Falha ao criar serviço blockchain");

    // Criar usuário de teste
    let (user_id, wallet_address) = create_test_user(&config.db_pool).await;

    // Primeiro verificar transação na blockchain
    let tx_request = VerifyTransactionRequest {
        transaction_hash: "0x123...".to_string(),
    };

    let verification = blockchain_service
        .verify_assets(&tx_request)
        .await
        .expect("Falha ao verificar ativos");

    assert!(verification.verified);

    // Agora analisar risco com base na verificação
    let analysis_request = AnalysisRequest {
        user_id,
        wallet_address: wallet_address.clone(),
    };

    let analysis = ai_service
        .analyze_risk(analysis_request)
        .await
        .expect("Falha ao analisar risco");

    // Verificar se a análise considerou a verificação blockchain
    assert!(analysis.score >= 0.0 && analysis.score <= 100.0);
    assert!(analysis.confidence >= 0.0 && analysis.confidence <= 1.0);
    assert!(!analysis.factors.is_empty());

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

    let saved_analysis = sqlx::query!(
        r#"
        SELECT * FROM ai_analyses 
        WHERE user_id = $1
        "#,
        user_id
    )
    .fetch_one(&config.db_pool)
    .await
    .expect("Falha ao buscar análise salva");

    assert_eq!(saved_verification.verified, verification.verified);
    assert_eq!(saved_analysis.user_id, user_id);
}

#[tokio::test]
async fn test_risk_analysis_with_multiple_verifications() {
    let config = TestConfig::new().await;
    let ai_service = AIService::new(config.db_pool.clone(), config.ollama_url);
    let blockchain_service = BlockchainService::new(config.blockchain_rpc, config.db_pool.clone())
        .expect("Falha ao criar serviço blockchain");

    // Criar usuário de teste
    let (user_id, wallet_address) = create_test_user(&config.db_pool).await;

    // Verificar múltiplas transações
    let tx_hashes = vec!["0x123...", "0x456...", "0x789..."];
    
    for tx_hash in tx_hashes {
        let tx_request = VerifyTransactionRequest {
            transaction_hash: tx_hash.to_string(),
        };

        let verification = blockchain_service
            .verify_assets(&tx_request)
            .await
            .expect("Falha ao verificar ativos");

        assert!(verification.verified);
    }

    // Analisar risco considerando todas as verificações
    let analysis_request = AnalysisRequest {
        user_id,
        wallet_address,
    };

    let analysis = ai_service
        .analyze_risk(analysis_request)
        .await
        .expect("Falha ao analisar risco");

    // A análise deve considerar o histórico completo
    assert!(analysis.confidence > 0.8); // Confiança maior devido a mais dados
    assert!(!analysis.factors.is_empty());

    // Verificar se todas as verificações foram salvas
    let saved_verifications = sqlx::query!(
        r#"
        SELECT COUNT(*) as count FROM blockchain_verifications
        "#
    )
    .fetch_one(&config.db_pool)
    .await
    .expect("Falha ao contar verificações");

    assert_eq!(saved_verifications.count.unwrap() as usize, tx_hashes.len());
}

#[tokio::test]
async fn test_risk_analysis_with_failed_verification() {
    let config = TestConfig::new().await;
    let ai_service = AIService::new(config.db_pool.clone(), config.ollama_url);
    let blockchain_service = BlockchainService::new(config.blockchain_rpc, config.db_pool.clone())
        .expect("Falha ao criar serviço blockchain");

    // Criar usuário de teste
    let (user_id, wallet_address) = create_test_user(&config.db_pool).await;

    // Tentar verificar transação inválida
    let tx_request = VerifyTransactionRequest {
        transaction_hash: "invalid_hash".to_string(),
    };

    let verification_result = blockchain_service.verify_assets(&tx_request).await;
    assert!(verification_result.is_err());

    // A análise de risco deve prosseguir mesmo com falha na verificação
    let analysis_request = AnalysisRequest {
        user_id,
        wallet_address,
    };

    let analysis = ai_service
        .analyze_risk(analysis_request)
        .await
        .expect("Falha ao analisar risco");

    // A confiança deve ser menor devido à falta de dados blockchain
    assert!(analysis.confidence < 0.8);
} 