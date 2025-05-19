use serde::{Serialize, Deserialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    pub blockchain: BlockchainConfig,
    pub kyc: KYCConfig,
    pub rate_limit: RateLimitConfig,
    pub logging: LoggingConfig,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BlockchainConfig {
    pub rpc_url: String,
    pub chain_id: u64,
    pub contract_address: String,
    pub gas_limit: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct KYCConfig {
    pub min_score_risco: u8,
    pub max_score_risco: u8,
    pub documentos_aceitos: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RateLimitConfig {
    pub max_requests: u64,
    pub window_seconds: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoggingConfig {
    pub level: String,
    pub file_path: String,
}

impl Config {
    pub fn load(path: &Path) -> Result<Self, Box<dyn std::error::Error>> {
        let contents = fs::read_to_string(path)?;
        let config: Config = serde_json::from_str(&contents)?;
        Ok(config)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::NamedTempFile;

    #[test]
    fn test_config_load() {
        let config = Config {
            blockchain: BlockchainConfig {
                rpc_url: "https://mainnet.infura.io/v3/your-project-id".to_string(),
                chain_id: 1,
                contract_address: "0x123...".to_string(),
                gas_limit: 3000000,
            },
            kyc: KYCConfig {
                min_score_risco: 0,
                max_score_risco: 100,
                documentos_aceitos: vec!["CPF".to_string(), "CNPJ".to_string()],
            },
            rate_limit: RateLimitConfig {
                max_requests: 100,
                window_seconds: 3600,
            },
            logging: LoggingConfig {
                level: "info".to_string(),
                file_path: "logs/app.log".to_string(),
            },
        };

        let temp_file = NamedTempFile::new().unwrap();
        let config_str = serde_json::to_string_pretty(&config).unwrap();
        fs::write(&temp_file, config_str).unwrap();

        let loaded_config = Config::load(temp_file.path()).unwrap();
        assert_eq!(loaded_config.blockchain.chain_id, config.blockchain.chain_id);
    }
} 