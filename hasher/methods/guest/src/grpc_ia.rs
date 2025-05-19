//! Cliente gRPC para integração com IA Engine (Python)

use tonic::transport::Channel;
use tonic::Request;
use ethers::prelude::*;
use ethers::utils::hash_message;

// Protobuf gerado (exemplo)
pub mod ia_proto {
    tonic::include_proto!("iaengine");
}

use ia_proto::{risk_input::*, RiskInput, RiskResult};

pub struct IAClient {
    client: ia_proto::ia_engine_client::IaEngineClient<Channel>,
}

impl IAClient {
    pub async fn connect(addr: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let client = ia_proto::ia_engine_client::IaEngineClient::connect(addr.to_string()).await?;
        Ok(Self { client })
    }

    pub async fn analyze_risk(&mut self, input: RiskInput) -> Result<RiskResult, Box<dyn std::error::Error>> {
        let response = self.client.analyze_risk(Request::new(input)).await?;
        Ok(response.into_inner())
    }
}

pub fn verify_signature(address: &str, nonce: &str, signature: &str) -> bool {
    let address: Address = address.parse().unwrap();
    let signature = signature.strip_prefix("0x").unwrap_or(signature);
    let signature = hex::decode(signature).unwrap();
    let signature = Signature::try_from(signature.as_slice()).unwrap();

    let message_hash = hash_message(nonce);
    match signature.recover(message_hash) {
        Ok(recovered) => recovered == address,
        Err(_) => false,
    }
}

#[derive(serde::Deserialize)]
pub struct AuthNonceRequest { pub user_id: String }
#[derive(serde::Serialize)]
pub struct AuthNonceResponse { pub nonce: String }
#[derive(serde::Deserialize)]
pub struct AuthVerifyRequest { pub user_id: String, pub address: String, pub signature: String }
#[derive(serde::Serialize)]
pub struct AuthVerifyResponse { pub authenticated: bool } 