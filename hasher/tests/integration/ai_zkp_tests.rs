use super::*;
use crate::services::{
    ai::{AIService, AnalysisRequest},
    zkp::{ZKPService, GenerateProofRequest, VerifyProofRequest},
};

#[tokio::test]
async fn test_risk_analysis_with_zkp_verification() {
    let config = TestConfig::new().await;
    let ai_service = AIService::new(config.db_pool.clone(), config.ollama_url);
    let zkp_service = ZKPService::new(config.db_pool.clone());

    // Criar usuário de teste
    let (user_id, wallet_address) = create_test_user(&config.db_pool).await;

    // Gerar prova ZKP para os dados do usuário
    let proof_request = GenerateProofRequest {
        public_inputs: vec![
            wallet_address.clone(),
            "100.0".to_string(), // Exemplo de saldo
        ],
    };

    let proof = zkp_service
        .generate_proof(proof_request)
        .await
        .expect("Falha ao gerar prova");

    // Verificar a prova
    let verify_request = VerifyProofRequest {
        proof: proof.proof.clone(),
        public_inputs: proof.public_inputs.clone(),
        verification_key: proof.verification_key.clone(),
    };

    let is_valid = zkp_service
        .verify_proof(&verify_request)
        .await
        .expect("Falha ao verificar prova");

    assert!(is_valid);

    // Analisar risco com base na prova ZKP
    let analysis_request = AnalysisRequest {
        user_id,
        wallet_address,
    };

    let analysis = ai_service
        .analyze_risk(analysis_request)
        .await
        .expect("Falha ao analisar risco");

    // Verificar se a análise considerou a prova ZKP
    assert!(analysis.score >= 0.0 && analysis.score <= 100.0);
    assert!(analysis.confidence >= 0.0 && analysis.confidence <= 1.0);
    assert!(!analysis.factors.is_empty());

    // Verificar se os dados foram salvos corretamente
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

    assert_eq!(saved_proof.id, proof.id);
    assert_eq!(saved_analysis.user_id, user_id);
}

#[tokio::test]
async fn test_risk_analysis_with_multiple_zkp_proofs() {
    let config = TestConfig::new().await;
    let ai_service = AIService::new(config.db_pool.clone(), config.ollama_url);
    let zkp_service = ZKPService::new(config.db_pool.clone());

    // Criar usuário de teste
    let (user_id, wallet_address) = create_test_user(&config.db_pool).await;

    // Gerar múltiplas provas ZKP
    let proof_inputs = vec![
        vec![wallet_address.clone(), "100.0".to_string()],
        vec![wallet_address.clone(), "200.0".to_string()],
        vec![wallet_address.clone(), "300.0".to_string()],
    ];

    for inputs in proof_inputs {
        let proof_request = GenerateProofRequest {
            public_inputs: inputs,
        };

        let proof = zkp_service
            .generate_proof(proof_request)
            .await
            .expect("Falha ao gerar prova");

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

    // Analisar risco considerando todas as provas
    let analysis_request = AnalysisRequest {
        user_id,
        wallet_address,
    };

    let analysis = ai_service
        .analyze_risk(analysis_request)
        .await
        .expect("Falha ao analisar risco");

    // A análise deve considerar todas as provas
    assert!(analysis.confidence > 0.8); // Confiança maior devido a mais dados
    assert!(!analysis.factors.is_empty());

    // Verificar contagem de registros
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

    assert_eq!(proof_count as usize, 3);
}

#[tokio::test]
async fn test_risk_analysis_with_invalid_zkp() {
    let config = TestConfig::new().await;
    let ai_service = AIService::new(config.db_pool.clone(), config.ollama_url);
    let zkp_service = ZKPService::new(config.db_pool.clone());

    // Criar usuário de teste
    let (user_id, wallet_address) = create_test_user(&config.db_pool).await;

    // Tentar gerar prova com dados inválidos
    let proof_request = GenerateProofRequest {
        public_inputs: vec!["invalid_input".to_string()],
    };

    let proof_result = zkp_service.generate_proof(proof_request).await;
    assert!(proof_result.is_err());

    // A análise de risco deve prosseguir mesmo sem provas ZKP válidas
    let analysis_request = AnalysisRequest {
        user_id,
        wallet_address,
    };

    let analysis = ai_service
        .analyze_risk(analysis_request)
        .await
        .expect("Falha ao analisar risco");

    // A confiança deve ser menor devido à falta de provas ZKP
    assert!(analysis.confidence < 0.8);
} 