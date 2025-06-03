# Documentação Técnica - IbelieveFinance

## Índice
1. [Arquitetura do Sistema](#arquitetura-do-sistema)
2. [Smart Contracts](#smart-contracts)
3. [Frontend](#frontend)
4. [Backend](#backend)
5. [Serviços de Infraestrutura](#serviços-de-infraestrutura)
6. [Segurança](#segurança)
7. [Monitoramento](#monitoramento)
8. [Deploy](#deploy)

## Arquitetura do Sistema

### Visão Geral
O sistema é composto por múltiplos componentes:
- Frontend (React/TypeScript)
- Backend API (Node.js)
- Smart Contracts (Sepolia Testnet)
- Serviços de Infraestrutura
- Serviços de Monitoramento

### Diagrama de Arquitetura
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │     │    Backend      │     │  Smart Contracts │
│    (React)      │◄────┤    (Node.js)    │◄────┤    (Sepolia)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                       ▲                       ▲
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Web3.js      │     │   PostgreSQL    │     │   ACME Token    │
│    Interface    │     │     Redis       │     │  ZKProofRegistry │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                       ▲                       ▲
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Ollama       │     │  Elasticsearch  │     │    Ganache      │
│    (IA)         │     │    Prometheus   │     │    Polkadot     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Smart Contracts

### ACMEToken (ACME tVFY)
- **Função**: Token de governança e custos
- **Supply Inicial**: 100 ACME
- **Decimais**: 18
- **Recursos**:
  - Sistema de subwallets
  - Controle de pausa
  - Queima de tokens

### ZKProofRegistry
- **Função**: Registro e verificação de provas
- **Custo**: 0.1 ACME por prova
- **Descontos**: Até 30%
- **Recursos**:
  - Sistema de descontos progressivo
  - Verificação em duas etapas
  - Recuperação de emergência

## Frontend

### Tecnologias
- React 18.2.0
- TypeScript 4.9.5
- Material-UI 5.13.1
- Web3.js 4.0.3
- Redux Toolkit
- React Router 6.22.0

### Componentes Principais
- **WalletConnect**: Gerenciamento de conexão com carteiras
- **ZKPVerification**: Verificação de provas zero-knowledge
- **SmartContractInteraction**: Interação com contratos inteligentes
- **TransactionHistory**: Histórico de transações
- **NetworkStatus**: Monitoramento de status da rede
- **GasEstimator**: Estimativa de custos de gas
- **TokenBalance**: Visualização de saldo de tokens
- **TransactionConfirmation**: Confirmação de transações
- **ErrorBoundary**: Tratamento de erros
- **LoadingSpinner**: Indicadores de carregamento
- **Notification**: Sistema de notificações
- **RiskAnalysis**: Análise de risco
- **FraudDetection**: Detecção de fraudes
- **AIVirtualAssistant**: Assistente virtual com IA

### Integração Blockchain
- Conexão via Web3
- Suporte MetaMask e SubWallet
- Gestão de transações
- Monitoramento de rede
- Estimativa de gas

## Backend

### Tecnologias
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Redis
- Web3.js

### Serviços
- **API REST**: Endpoints para interação com o frontend
- **WebSocket**: Comunicação em tempo real
- **Cache**: Gerenciamento de cache com Redis
- **Database**: Persistência de dados com PostgreSQL
- **Blockchain**: Integração com contratos inteligentes
- **IA**: Integração com Ollama para análise

## Serviços de Infraestrutura

### Banco de Dados
- **PostgreSQL**
  - Porta: 5432
  - Usuário: postgres
  - Senha: postgres
  - Banco: ibelieve

### Cache
- **Redis**
  - Porta: 6379
  - Persistência habilitada
  - Cache distribuído

### IA
- **Ollama**
  - Porta: 11434
  - Modelo: gemma-mistral
  - GPU NVIDIA requerida

### Blockchain
- **Ganache**
  - Porta: 8545
  - Network ID: 11155111
  - Chain ID: 11155111

- **Polkadot**
  - Porta: 9944
  - WebSocket habilitado
  - Pruning archive

## Segurança

### Smart Contracts
- Controle de acesso por subwallets
- Sistema de pausa
- Limites e validações
- Recuperação de emergência

### Frontend
- Validação de inputs
- Tratamento de erros
- Proteção contra ataques XSS
- Gestão segura de chaves
- Detecção de fraudes
- Análise de risco
- Verificação ZKP

### Backend
- Autenticação JWT
- Rate limiting
- Validação de dados
- Sanitização de inputs
- Criptografia de dados sensíveis

## Monitoramento

### Métricas
- **Prometheus**
  - Porta: 9090
  - Coleta de métricas
  - Alertas configuráveis

- **Grafana**
  - Porta: 3004
  - Visualização de métricas
  - Dashboards personalizados

### Logs
- **Elasticsearch**
  - Porta: 9200
  - Armazenamento de logs
  - Busca e análise

### Eventos
```solidity
// ACMEToken
event TokensBurned(address indexed from, uint256 amount);
event TokensMinted(address indexed to, uint256 amount);
event SubwalletRegistered(address indexed wallet, string name);
event SubwalletRemoved(address indexed wallet);
event SubwalletUpdated(address indexed wallet, string newName);

// ZKProofRegistry
event ProofRegistered(
    bytes32 indexed proofHash,
    address indexed verifier,
    uint256 timestamp,
    uint256 tokenAmount,
    address subwallet
);
event ProofVerified(bytes32 indexed proofHash, address indexed verifier);
event RegistrationCostUpdated(uint256 oldCost, uint256 newCost);
event EmergencyRecovery(address token, uint256 amount);
```

## Deploy

### Pré-requisitos
- Docker
- Docker Compose
- Node.js >= 14
- Yarn
- NVIDIA GPU (para Ollama)

### Smart Contracts
1. Deploy ACMEToken:
   ```solidity
   // Não requer parâmetros
   // Supply inicial: 100 ACME
   ```

2. Deploy ZKProofRegistry:
   ```solidity
   // Parâmetro: endereço do ACMEToken
   constructor(address _acmeToken)
   ```

3. Configuração inicial:
   ```solidity
   // Registrar subwallet principal
   registerSubwallet(address, "Nome")
   
   // Transferir tokens
   transfer(subwallet, amount)
   ```

### Serviços
1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/ibelieve-finance.git
cd ibelieve-finance
```

2. Configure as variáveis de ambiente:
```bash
cp frontend/.env-dev frontend/.env
# Edite o arquivo .env conforme necessário
```

3. Inicie todos os serviços:
```bash
./start-services.sh
```

4. Para encerrar:
```bash
./stop-services.sh
```

## Custos e Limites

### Tokens
- Supply inicial: 100 ACME
- Custo por prova: 0.1 ACME
- Desconto máximo: 30%

### Gas (Sepolia)
- Deploy ACMEToken: ~1.5-2M gas
- Deploy ZKProofRegistry: ~1-1.5M gas
- Registro de prova: ~100-150k gas
- Verificação: ~50-75k gas

### Limites
- Máximo de subwallets: 100
- Desconto progressivo: 3% por prova
- Desconto máximo após 10 provas

## Troubleshooting

### Problemas Comuns
1. Falha no registro de prova
   - Verificar saldo ACME
   - Verificar status da subwallet
   - Verificar gas

2. Erro de verificação
   - Confirmar hash da prova
   - Verificar permissões
   - Verificar estado do contrato

3. Problemas de conexão
   - Verificar rede (Sepolia)
   - Verificar MetaMask/SubWallet
   - Verificar RPC

### Logs e Debug
```typescript
// Web3Service
console.error('Erro ao registrar prova:', error);
console.error('Erro ao verificar prova:', error);
console.error('Erro ao conectar carteira:', error);

// ZKProofService
console.error('Erro ao gerar e registrar prova:', error);
console.error('Erro ao verificar prova:', error);
console.error('Erro ao buscar provas:', error);
```

## Suporte

### Canais
- GitHub Issues
- Documentação Técnica
- Guia de Contribuição

### Recursos
- [Solidity Docs](https://docs.soliditylang.org/)
- [Web3.js Docs](https://web3js.readthedocs.io/)
- [Sepolia Testnet](https://sepolia.dev/) 