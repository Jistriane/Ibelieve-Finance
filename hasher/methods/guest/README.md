# Sistema de Validação de Transações Financeiras com RISC Zero ZKVM

Este projeto implementa um sistema de validação de transações financeiras utilizando RISC Zero ZKVM para provas criptográficas. O sistema é projetado para plataformas de financiamento privado, oferecendo validações robustas e seguras para diferentes tipos de transações.

## Características

- Validação de transações financeiras (depósitos, saques, transferências e investimentos)
- Integração com blockchain
- Sistema de KYC/AML
- Rate limiting
- Logging e auditoria
- Prova criptográfica com RISC Zero ZKVM

## Requisitos

- Rust 1.70.0 ou superior
- RISC Zero ZKVM
- Node.js 16+ (para desenvolvimento)

## Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
cd hasher/methods/guest
```

2. Instale as dependências:
```bash
cargo build
```

3. Configure o ambiente:
- Copie o arquivo `config.json.example` para `config.json`
- Ajuste as configurações conforme necessário

## Configuração

O arquivo `config.json` contém as seguintes configurações:

```json
{
    "blockchain": {
        "rpc_url": "https://mainnet.infura.io/v3/seu-project-id",
        "chain_id": 1,
        "contract_address": "0x123...",
        "gas_limit": 3000000
    },
    "kyc": {
        "min_score_risco": 0,
        "max_score_risco": 100,
        "documentos_aceitos": ["CPF", "CNPJ", "Passaporte"]
    },
    "rate_limit": {
        "max_requests": 100,
        "window_seconds": 3600
    },
    "logging": {
        "level": "info",
        "file_path": "logs/app.log"
    }
}
```

## Uso

### Validação de Transações

O sistema suporta os seguintes tipos de transações:

1. **Depósito**
   - Valor mínimo: R$ 10,00
   - Limite diário: R$ 100.000,00
   - KYC obrigatório para valores acima de R$ 100.000,00

2. **Saque**
   - Valor mínimo: R$ 10,00
   - Limite diário: R$ 50.000,00
   - KYC obrigatório

3. **Transferência**
   - Valor mínimo: R$ 1,00
   - Limite por transação: R$ 10.000,00
   - KYC obrigatório para valores acima de R$ 10.000,00

4. **Investimento**
   - Valor mínimo: R$ 10.000,00
   - Valor máximo: R$ 1.000.000,00
   - KYC obrigatório
   - Score de risco mínimo: 70

### Exemplo de Uso

```rust
use hasher_guest::{TransacaoFinanciamento, TipoTransacao, DadosKYC};

let transacao = TransacaoFinanciamento {
    valor: 1000,
    destinatario: "0x123...".to_string(),
    timestamp: chrono::Utc::now().timestamp() as u64,
    nonce: 1,
    tipo_transacao: TipoTransacao::Transferencia,
    dados_kyc: None,
};

// A validação é feita automaticamente ao processar a transação
```

## Testes

Execute os testes com:

```bash
cargo test
```

## Logging

Os logs são salvos em:
- `logs/app.log` - Logs gerais do sistema
- `logs/transacoes.log` - Log de transações para auditoria

## Segurança

- Todas as transações são validadas criptograficamente
- KYC obrigatório para operações sensíveis
- Rate limiting para prevenir abusos
- Logging completo para auditoria

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Crie um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes. 