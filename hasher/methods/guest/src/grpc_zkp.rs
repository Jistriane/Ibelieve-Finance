//! Cliente gRPC para integração com ZKP Engine (ZoKrates/zkVerify)

use tonic::transport::Channel;
use tonic::Request;

// Protobuf gerado (exemplo)
pub mod zkp_proto {
    tonic::include_proto!("zkpengine");
}

use zkp_proto::{ProofInput, ProofResult, VerifyInput, VerifyResult};

pub struct ZKPClient {
    client: zkp_proto::zkp_engine_client::ZkpEngineClient<Channel>,
}

impl ZKPClient {
    pub async fn connect(addr: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let client = zkp_proto::zkp_engine_client::ZkpEngineClient::connect(addr.to_string()).await?;
        Ok(Self { client })
    }

    pub async fn generate_proof(&mut self, input: ProofInput) -> Result<ProofResult, Box<dyn std::error::Error>> {
        let response = self.client.generate_proof(Request::new(input)).await?;
        Ok(response.into_inner())
    }

    pub async fn verify_proof(&mut self, input: VerifyInput) -> Result<VerifyResult, Box<dyn std::error::Error>> {
        let response = self.client.verify_proof(Request::new(input)).await?;
        Ok(response.into_inner())
    }
} 

env_logger::init();

log::info!("Solicitação de solvência iniciada para user_id: {}", user_id);
log::warn!("Assinatura inválida para user_id: {}", user_id);
log::error!("Erro ao chamar IA Engine: {:?}", err); 

/// Solicita um nonce para autenticação via carteira
#[utoipa::path(
    get,
    path = "/api/auth/nonce",
    params(
        ("user_id" = String, Query, description = "ID do usuário")
    ),
    responses(
        (status = 200, description = "Nonce gerado", body = AuthNonceResponse)
    )
)] 