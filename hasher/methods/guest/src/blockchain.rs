//! Módulo de integração com smart contract (Solidity) via web3/ethers

use ethers::prelude::*;
use std::sync::Arc;

pub struct BlockchainClient {
    pub provider: Arc<Provider<Http>>,
    pub contract: Contract<Provider<Http>>,
}

impl BlockchainClient {
    pub async fn new(rpc_url: &str, contract_address: &str, abi_json: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let provider = Provider::<Http>::try_from(rpc_url)?;
        let provider = Arc::new(provider);
        let address: Address = contract_address.parse()?;
        let abi: Abi = serde_json::from_str(abi_json)?;
        let contract = Contract::new(address, abi, provider.clone());
        Ok(Self { provider, contract })
    }

    pub async fn enviar_prova(&self, prova: Vec<u8>) -> Result<TxHash, Box<dyn std::error::Error>> {
        // Exemplo: chamar função "verificarProva" do contrato
        let tx = self.contract.method::<_, H256>("verificarProva", prova)?.send().await?;
        Ok(tx)
    }

    pub async fn consultar_status(&self, id: U256) -> Result<String, Box<dyn std::error::Error>> {
        // Exemplo: chamar função "statusSolicitacao" do contrato
        let status: String = self.contract.method::<_, String>("statusSolicitacao", id)?.call().await?;
        Ok(status)
    }
} 