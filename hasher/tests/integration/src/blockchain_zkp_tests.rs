use crate::TestClient;
use std::error::Error;
use test_log::test;

#[test(tokio::test)]
async fn test_blockchain_zkp_integration() -> Result<(), Box<dyn Error>> {
    let client = TestClient::new("postgres://postgres:postgres@localhost:5432/test_db").await?;

    // Criar usuário
    let user = client.create_user("0x123...").await?;

    // Verificar transação
    let verification = client.verify_transaction(user.id, "0xabc...").await?;
    assert_eq!(verification.user_id, user.id);

    // Gerar prova após verificação
    let proof = client.generate_proof(user.id).await?;
    assert!(proof.verification_result);

    Ok(())
} 