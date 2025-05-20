use crate::TransacaoFinanciamento;
use std::error::Error;
use std::collections::HashMap;
use chrono::{DateTime, Utc, Duration};

const LIMITE_DEPOSITO_DIARIO: u64 = 100_000_000; // 100 milhões em centavos
const LIMITE_SAQUE_DIARIO: u64 = 50_000_000; // 50 milhões em centavos
const LIMITE_TRANSFERENCIA: u64 = 10_000_000; // 10 milhões em centavos
const LIMITE_INVESTIMENTO_MINIMO: u64 = 1_000_000; // 1 milhão em centavos
const LIMITE_INVESTIMENTO_MAXIMO: u64 = 1_000_000_000; // 1 bilhão em centavos

pub struct ValidacaoContexto {
    depositos_diarios: HashMap<String, u64>,
    saques_diarios: HashMap<String, u64>,
    ultima_atualizacao: DateTime<Utc>,
}

impl ValidacaoContexto {
    pub fn new() -> Self {
        Self {
            depositos_diarios: HashMap::new(),
            saques_diarios: HashMap::new(),
            ultima_atualizacao: Utc::now(),
        }
    }

    pub fn atualizar_limites_diarios(&mut self) {
        let agora = Utc::now();
        if agora - self.ultima_atualizacao > Duration::days(1) {
            self.depositos_diarios.clear();
            self.saques_diarios.clear();
            self.ultima_atualizacao = agora;
        }
    }
}

pub fn validar_deposito(
    transacao: &TransacaoFinanciamento,
    contexto: &mut ValidacaoContexto,
) -> Result<(), Box<dyn Error>> {
    contexto.atualizar_limites_diarios();

    // Validação de valor mínimo
    if transacao.valor < 1000 {
        return Err("Valor mínimo para depósito é R$ 10,00".into());
    }

    // Validação de limite diário
    let total_diario = contexto
        .depositos_diarios
        .get(&transacao.destinatario)
        .unwrap_or(&0)
        + transacao.valor;

    if total_diario > LIMITE_DEPOSITO_DIARIO {
        return Err("Limite diário de depósito excedido".into());
    }

    // Validação de KYC para depósitos grandes
    if transacao.valor > 10_000_000 {
        if transacao.dados_kyc.is_none() {
            return Err("KYC obrigatório para depósitos acima de R$ 100.000,00".into());
        }
    }

    // Atualiza o contador de depósitos
    contexto
        .depositos_diarios
        .insert(transacao.destinatario.clone(), total_diario);

    Ok(())
}

pub fn validar_saque(
    transacao: &TransacaoFinanciamento,
    contexto: &mut ValidacaoContexto,
) -> Result<(), Box<dyn Error>> {
    contexto.atualizar_limites_diarios();

    // Validação de valor mínimo
    if transacao.valor < 1000 {
        return Err("Valor mínimo para saque é R$ 10,00".into());
    }

    // Validação de limite diário
    let total_diario = contexto
        .saques_diarios
        .get(&transacao.destinatario)
        .unwrap_or(&0)
        + transacao.valor;

    if total_diario > LIMITE_SAQUE_DIARIO {
        return Err("Limite diário de saque excedido".into());
    }

    // KYC obrigatório para saques
    if transacao.dados_kyc.is_none() {
        return Err("KYC obrigatório para saques".into());
    }

    // Atualiza o contador de saques
    contexto
        .saques_diarios
        .insert(transacao.destinatario.clone(), total_diario);

    Ok(())
}

pub fn validar_transferencia(
    transacao: &TransacaoFinanciamento,
    contexto: &mut ValidacaoContexto,
) -> Result<(), Box<dyn Error>> {
    // Validação de valor mínimo
    if transacao.valor < 100 {
        return Err("Valor mínimo para transferência é R$ 1,00".into());
    }

    // Validação de limite por transferência
    if transacao.valor > LIMITE_TRANSFERENCIA {
        return Err("Limite por transferência excedido".into());
    }

    // KYC obrigatório para transferências acima de R$ 10.000,00
    if transacao.valor > 1_000_000 && transacao.dados_kyc.is_none() {
        return Err("KYC obrigatório para transferências acima de R$ 10.000,00".into());
    }

    Ok(())
}

pub fn validar_investimento(
    transacao: &TransacaoFinanciamento,
    contexto: &mut ValidacaoContexto,
) -> Result<(), Box<dyn Error>> {
    // Validação de valor mínimo
    if transacao.valor < LIMITE_INVESTIMENTO_MINIMO {
        return Err("Valor mínimo para investimento é R$ 10.000,00".into());
    }

    // Validação de valor máximo
    if transacao.valor > LIMITE_INVESTIMENTO_MAXIMO {
        return Err("Valor máximo para investimento excedido".into());
    }

    // KYC obrigatório para investimentos
    if transacao.dados_kyc.is_none() {
        return Err("KYC obrigatório para investimentos".into());
    }

    // Validação de score de risco para investimentos
    if let Some(dados_kyc) = &transacao.dados_kyc {
        if dados_kyc.score_risco < 70 {
            return Err("Score de risco insuficiente para investimento".into());
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{DadosKYC, TipoDocumento, TipoTransacao};

    fn criar_transacao_basica(valor: u64, tipo: TipoTransacao) -> TransacaoFinanciamento {
        TransacaoFinanciamento {
            valor,
            destinatario: "0x123...".to_string(),
            timestamp: chrono::Utc::now().timestamp() as u64,
            nonce: 1,
            tipo_transacao: tipo,
            dados_kyc: None,
        }
    }

    fn criar_transacao_com_kyc(valor: u64, tipo: TipoTransacao, score: u8) -> TransacaoFinanciamento {
        TransacaoFinanciamento {
            valor,
            destinatario: "0x123...".to_string(),
            timestamp: chrono::Utc::now().timestamp() as u64,
            nonce: 1,
            tipo_transacao: tipo,
            dados_kyc: Some(DadosKYC {
                nome_completo: "João Silva".to_string(),
                documento: "123.456.789-00".to_string(),
                tipo_documento: TipoDocumento::CPF,
                data_nascimento: Utc::now(),
                score_risco: score,
            }),
        }
    }

    #[test]
    fn test_validar_deposito_valor_minimo() {
        let mut contexto = ValidacaoContexto::new();
        let transacao = criar_transacao_basica(500, TipoTransacao::Deposito);
        assert!(validar_deposito(&transacao, &mut contexto).is_err());
    }

    #[test]
    fn test_validar_deposito_limite_diario() {
        let mut contexto = ValidacaoContexto::new();
        let transacao = criar_transacao_basica(LIMITE_DEPOSITO_DIARIO + 1, TipoTransacao::Deposito);
        assert!(validar_deposito(&transacao, &mut contexto).is_err());
    }

    #[test]
    fn test_validar_saque_sem_kyc() {
        let mut contexto = ValidacaoContexto::new();
        let transacao = criar_transacao_basica(1000, TipoTransacao::Saque);
        assert!(validar_saque(&transacao, &mut contexto).is_err());
    }

    #[test]
    fn test_validar_investimento_score_baixo() {
        let mut contexto = ValidacaoContexto::new();
        let transacao = criar_transacao_com_kyc(
            LIMITE_INVESTIMENTO_MINIMO,
            TipoTransacao::Investimento,
            50,
        );
        assert!(validar_investimento(&transacao, &mut contexto).is_err());
    }

    #[test]
    fn test_validar_transferencia_limite() {
        let mut contexto = ValidacaoContexto::new();
        let transacao = criar_transacao_basica(LIMITE_TRANSFERENCIA + 1, TipoTransacao::Transferencia);
        assert!(validar_transferencia(&transacao, &mut contexto).is_err());
    }
} 