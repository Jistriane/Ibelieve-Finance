use crate::TestClient;
use std::error::Error;
use test_log::test;

#[test(tokio::test)]
async fn test_ai_zkp_integration() -> Result<(), Box<dyn Error>> {
    let client = TestClient::new("postgres://postgres:postgres@localhost:5432/test_db").await?;

    // Criar usuário
    let user = client.create_user("0x123...").await?;

    // Gerar prova
    let proof = client.generate_proof(user.id).await?;
    assert!(proof.verification_result);

    // Analisar risco após prova
    let analysis = client.analyze_risk(user.id).await?;
    assert!(analysis.risk_score >= 0.0 && analysis.risk_score <= 100.0);

    Ok(())
} 