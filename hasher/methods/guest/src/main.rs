use risc0_zkvm::guest::env;
use sha2::{Digest, Sha256};
use std::error::Error;
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use std::time::{SystemTime, UNIX_EPOCH};
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use log::{info, error, warn};
use std::fs;
use std::path::Path;

mod validations;
use validations::{ValidacaoContexto, validar_deposito, validar_saque, validar_transferencia, validar_investimento};

/// Estrutura para representar uma transação de financiamento
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TransacaoFinanciamento {
    pub valor: u64,
    pub destinatario: String,
    pub timestamp: u64,
    pub nonce: u64,
    pub tipo_transacao: TipoTransacao,
    pub dados_kyc: Option<DadosKYC>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum TipoTransacao {
    Deposito,
    Saque,
    Transferencia,
    Investimento,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DadosKYC {
    pub nome_completo: String,
    pub documento: String,
    pub tipo_documento: TipoDocumento,
    pub data_nascimento: DateTime<Utc>,
    pub score_risco: u8,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum TipoDocumento {
    CPF,
    CNPJ,
    Passaporte,
}

/// Estrutura para gerenciar rate limiting
pub struct RateLimiter {
    contador: AtomicU64,
    limite: u64,
    janela_tempo: u64,
}

impl RateLimiter {
    pub fn new(limite: u64, janela_tempo: u64) -> Self {
        Self {
            contador: AtomicU64::new(0),
            limite,
            janela_tempo,
        }
    }

    pub fn verificar_limite(&self) -> Result<(), Box<dyn Error>> {
        let atual = self.contador.fetch_add(1, Ordering::SeqCst);
        if atual >= self.limite {
            return Err("Limite de requisições excedido".into());
        }
        Ok(())
    }
}

/// Função principal que calcula o hash SHA-256 de uma transação
/// e envia o resultado para o journal do ambiente RISC Zero ZKVM.
fn main() -> Result<(), Box<dyn Error>> {
    // Configura o logger
    env_logger::init();
    info!("Iniciando processamento de transação");

    // Carrega a configuração
    let config = carregar_configuracao()?;
    
    // Inicializa o rate limiter
    let rate_limiter = RateLimiter::new(
        config.rate_limit.max_requests,
        config.rate_limit.window_seconds,
    );
    
    // Verifica o limite de requisições
    rate_limiter.verificar_limite()?;

    // Lê a entrada do ambiente
    let input: String = env::read();
    
    // Valida o formato da entrada
    if input.is_empty() {
        error!("Entrada vazia recebida");
        return Err("Entrada vazia não permitida".into());
    }

    // Deserializa a transação
    let transacao: TransacaoFinanciamento = serde_json::from_str(&input)?;
    
    // Inicializa o contexto de validação
    let mut contexto = ValidacaoContexto::new();
    
    // Valida a transação de acordo com seu tipo
    match transacao.tipo_transacao {
        TipoTransacao::Deposito => {
            info!("Validando depósito");
            validar_deposito(&transacao, &mut contexto)?;
        }
        TipoTransacao::Saque => {
            info!("Validando saque");
            validar_saque(&transacao, &mut contexto)?;
        }
        TipoTransacao::Transferencia => {
            info!("Validando transferência");
            validar_transferencia(&transacao, &mut contexto)?;
        }
        TipoTransacao::Investimento => {
            info!("Validando investimento");
            validar_investimento(&transacao, &mut contexto)?;
        }
    }

    // Inicializa o hasher SHA-256
    let mut hasher = Sha256::new();
    
    // Atualiza o hasher com os bytes da entrada
    hasher.update(input.as_bytes());
    
    // Finaliza o cálculo do hash
    let result = hasher.finalize();
    
    // Converte o resultado para string hexadecimal
    let output = format!("{:x}", result);
    
    // Valida o tamanho do hash (deve ser 64 caracteres em hex)
    if output.len() != 64 {
        error!("Hash inválido gerado");
        return Err("Hash inválido".into());
    }
    
    // Registra a transação para auditoria
    registrar_transacao(&transacao, &output)?;
    
    // Envia o resultado para o journal do ambiente
    env::commit(&output);
    
    info!("Transação processada com sucesso");
    Ok(())
}

fn carregar_configuracao() -> Result<crate::config::Config, Box<dyn Error>> {
    let config_path = Path::new("config.json");
    if !config_path.exists() {
        warn!("Arquivo de configuração não encontrado, usando configuração padrão");
        return Ok(crate::config::Config {
            blockchain: crate::config::BlockchainConfig {
                rpc_url: "https://mainnet.infura.io/v3/seu-project-id".to_string(),
                chain_id: 1,
                contract_address: "0x1234567890123456789012345678901234567890".to_string(),
                gas_limit: 3000000,
            },
            kyc: crate::config::KYCConfig {
                min_score_risco: 0,
                max_score_risco: 100,
                documentos_aceitos: vec!["CPF".to_string(), "CNPJ".to_string()],
            },
            rate_limit: crate::config::RateLimitConfig {
                max_requests: 100,
                window_seconds: 3600,
            },
            logging: crate::config::LoggingConfig {
                level: "info".to_string(),
                file_path: "logs/app.log".to_string(),
            },
        });
    }
    
    crate::config::Config::load(config_path)
}

fn registrar_transacao(transacao: &TransacaoFinanciamento, hash: &str) -> Result<(), Box<dyn Error>> {
    let log_dir = Path::new("logs");
    if !log_dir.exists() {
        fs::create_dir_all(log_dir)?;
    }
    
    let log_file = log_dir.join("transacoes.log");
    let log_entry = format!(
        "{} - Transação: {:?}, Hash: {}\n",
        chrono::Utc::now(),
        transacao,
        hash
    );
    
    fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(log_file)?
        .write_all(log_entry.as_bytes())?;
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    #[test]
    fn test_validar_transacao_basica() {
        let transacao = TransacaoFinanciamento {
            valor: 1000,
            destinatario: "0x123...".to_string(),
            timestamp: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            nonce: 1,
            tipo_transacao: TipoTransacao::Transferencia,
            dados_kyc: None,
        };
        
        let mut contexto = ValidacaoContexto::new();
        assert!(validar_transferencia(&transacao, &mut contexto).is_ok());
    }

    #[test]
    fn test_validar_transacao_valor_zero() {
        let transacao = TransacaoFinanciamento {
            valor: 0,
            destinatario: "0x123...".to_string(),
            timestamp: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            nonce: 1,
            tipo_transacao: TipoTransacao::Transferencia,
            dados_kyc: None,
        };
        
        let mut contexto = ValidacaoContexto::new();
        assert!(validar_transferencia(&transacao, &mut contexto).is_err());
    }

    #[test]
    fn test_validar_kyc() {
        let dados_kyc = DadosKYC {
            nome_completo: "João Silva".to_string(),
            documento: "123.456.789-00".to_string(),
            tipo_documento: TipoDocumento::CPF,
            data_nascimento: Utc::now(),
            score_risco: 50,
        };
        
        let transacao = TransacaoFinanciamento {
            valor: 1000,
            destinatario: "0x123...".to_string(),
            timestamp: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            nonce: 1,
            tipo_transacao: TipoTransacao::Saque,
            dados_kyc: Some(dados_kyc),
        };
        
        let mut contexto = ValidacaoContexto::new();
        assert!(validar_saque(&transacao, &mut contexto).is_ok());
    }

    #[test]
    fn test_rate_limiter() {
        let limiter = RateLimiter::new(2, 3600);
        assert!(limiter.verificar_limite().is_ok());
        assert!(limiter.verificar_limite().is_ok());
        assert!(limiter.verificar_limite().is_err());
    }
}