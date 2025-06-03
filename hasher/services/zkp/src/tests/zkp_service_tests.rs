use super::*;
use bls12_381::Bls12;
use ff::PrimeField;
use sqlx::postgres::PgPoolOptions;
use tokio;
use uuid::Uuid;

async fn setup_test_db() -> PgPool {
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect("postgres://ibeleve:ibeleve@localhost:5432/ibeleve_test")
        .await
        .expect("Falha ao criar pool de teste");

    // Limpar tabelas de teste
    sqlx::query!("TRUNCATE TABLE zkp_proofs CASCADE")
        .execute(&pool)
        .await
        .expect("Falha ao limpar tabela de provas");

    pool
}

#[tokio::test]
async fn test_generate_proof_success() {
    let pool = setup_test_db().await;
    let service = ZKPService::new(pool.clone());

    let request = GenerateProofRequest {
        public_inputs: vec!["2".to_string(), "3".to_string()],
    };

    let result = service.generate_proof(request).await;
    assert!(result.is_ok());

    let proof = result.unwrap();
    assert!(!proof.proof.is_empty());
    assert_eq!(proof.public_inputs.len(), 2);
    assert!(!proof.verification_key.is_empty());

    // Verificar se foi salvo no banco
    let saved = sqlx::query!(
        "SELECT * FROM zkp_proofs WHERE id = $1",
        proof.id
    )
    .fetch_one(&pool)
    .await
    .expect("Falha ao buscar prova salva");

    assert_eq!(saved.id, proof.id);
    assert_eq!(saved.proof, proof.proof);
}

#[tokio::test]
async fn test_verify_proof_valid() {
    let pool = setup_test_db().await;
    let service = ZKPService::new(pool.clone());

    // Primeiro gerar uma prova válida
    let gen_request = GenerateProofRequest {
        public_inputs: vec!["2".to_string(), "3".to_string()],
    };

    let proof = service.generate_proof(gen_request).await.unwrap();

    // Agora verificar a prova
    let verify_request = VerifyProofRequest {
        proof: proof.proof,
        public_inputs: proof.public_inputs,
        verification_key: proof.verification_key,
    };

    let result = service.verify_proof(&verify_request).await;
    assert!(result.is_ok());
    assert!(result.unwrap());
}

#[tokio::test]
async fn test_verify_proof_invalid() {
    let pool = setup_test_db().await;
    let service = ZKPService::new(pool.clone());

    let verify_request = VerifyProofRequest {
        proof: "invalid_proof".to_string(),
        public_inputs: vec!["2".to_string(), "3".to_string()],
        verification_key: "invalid_key".to_string(),
    };

    let result = service.verify_proof(&verify_request).await;
    assert!(result.is_err());
}

#[tokio::test]
async fn test_get_proof_existing() {
    let pool = setup_test_db().await;
    let service = ZKPService::new(pool.clone());

    // Primeiro gerar uma prova
    let gen_request = GenerateProofRequest {
        public_inputs: vec!["2".to_string(), "3".to_string()],
    };

    let proof = service.generate_proof(gen_request).await.unwrap();

    // Agora buscar a prova
    let result = service.get_proof(proof.id).await;
    assert!(result.is_ok());

    let found = result.unwrap().expect("Prova deveria existir");
    assert_eq!(found.id, proof.id);
    assert_eq!(found.proof, proof.proof);
    assert_eq!(found.public_inputs, proof.public_inputs);
}

#[tokio::test]
async fn test_get_proof_nonexistent() {
    let pool = setup_test_db().await;
    let service = ZKPService::new(pool.clone());

    let result = service.get_proof(Uuid::new_v4()).await;
    assert!(result.is_ok());
    assert!(result.unwrap().is_none());
}

#[tokio::test]
async fn test_generate_proof_invalid_inputs() {
    let pool = setup_test_db().await;
    let service = ZKPService::new(pool.clone());

    let request = GenerateProofRequest {
        public_inputs: vec!["invalid".to_string(), "inputs".to_string()],
    };

    let result = service.generate_proof(request).await;
    assert!(result.is_err());
} 