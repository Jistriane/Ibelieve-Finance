# Configuração do Ambiente

Este documento descreve como configurar o ambiente de desenvolvimento para o projeto IbelieveFinance.

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Ollama (para IA local)
- MetaMask
- Conta Infura
- Conta Etherscan

## Configuração Inicial

1. Clone o repositório
```bash
git clone [URL_DO_REPOSITORIO]
cd IbelieveFinance
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env-dev`
   - Preencha todas as variáveis necessárias (veja seção abaixo)

## Variáveis de Ambiente

### Blockchain
- `REACT_APP_NETWORK_NAME`: Nome da rede (sepolia/mainnet)
- `REACT_APP_ZKPROOF_CONTRACT_ADDRESS`: Endereço do contrato ZKProof
- `REACT_APP_ACME_TOKEN_ADDRESS`: Endereço do contrato ACMEToken
- `REACT_APP_SUBWALLET_REGISTRY_ADDRESS`: Endereço do contrato SubwalletRegistry
- `SEPOLIA_URL`: URL do nó Sepolia (via Infura)
- `PRIVATE_KEY`: Chave privada da carteira de desenvolvimento
- `INFURA_API_KEY`: Chave API da Infura
- `ETHERSCAN_API_KEY`: Chave API do Etherscan
- `METAMASK_API_KEY`: Chave API do MetaMask

### Banco de Dados
- `POSTGRES_USER`: Usuário do PostgreSQL
- `POSTGRES_PASSWORD`: Senha do PostgreSQL
- `POSTGRES_DB`: Nome do banco de dados
- `POSTGRES_PORT`: Porta do PostgreSQL (padrão: 5432)
- `POSTGRES_HOST`: Host do PostgreSQL

### Redis
- `REDIS_PORT`: Porta do Redis (padrão: 6379)
- `REDIS_HOST`: Host do Redis

### Monitoramento
- `PROMETHEUS_PORT`: Porta do Prometheus
- `GRAFANA_PORT`: Porta do Grafana
- `GRAFANA_ADMIN_PASSWORD`: Senha admin do Grafana

### Logging
- `LOG_LEVEL`: Nível de log (debug/info/warn/error)
- `LOG_FORMAT`: Formato do log (json/text)

## Contratos Deployados (Sepolia)

Os seguintes contratos estão deployados na rede Sepolia:

- SubwalletRegistry: `0x52F3Ad1589ACD0c68a22A7C7e5F8263Aafb86acF`
- ACMEToken: `0x5f866A6C57425E55e78D30f17B6FF434F9c11180`
- ZKProofRegistry: `0xB2adA6C6DCdccD08DeAa875fe70d51c83d0A1d8b`

## Scripts de Ambiente

### Backup de Variáveis
Para criar um backup criptografado das variáveis de ambiente:
```bash
npm run env:backup
```

### Restaurar Backup
Para restaurar um backup anterior:
```bash
npm run env:restore
```

### Validação de Ambiente
Para validar se todas as variáveis de ambiente estão configuradas corretamente:
```bash
npm run env:validate
```

## Segurança

- Nunca compartilhe suas chaves privadas ou API keys
- Mantenha os backups das variáveis de ambiente em local seguro
- Use sempre HTTPS para comunicação com APIs
- Implemente rate limiting em endpoints sensíveis
- Configure CORS adequadamente para seu ambiente

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco de dados**
   - Verifique se o PostgreSQL está rodando
   - Confirme as credenciais no arquivo .env-dev
   - Verifique se o banco foi criado

2. **Erro de conexão com Redis**
   - Verifique se o Redis está rodando
   - Confirme a porta e host no arquivo .env-dev

3. **Erro de conexão com blockchain**
   - Verifique sua conexão com internet
   - Confirme se as chaves API estão válidas
   - Verifique o saldo da carteira para operações

## Suporte

Para questões relacionadas ao ambiente, entre em contato com a equipe de DevOps ou abra uma issue no repositório. 