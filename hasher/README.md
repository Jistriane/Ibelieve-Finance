# Ibelieve Finance

Sistema distribuído em Rust para verificação de transações blockchain usando Zero Knowledge Proofs (ZKP) e análise de risco com IA.

## Arquitetura

O sistema é composto por três microserviços:

1. **AI Service**: Análise de risco usando Ollama Mistral
   - Endpoint: http://localhost:3001
   - API: `/api/v1/ai/analyze` e `/api/v1/ai/{analysis_id}`

2. **Blockchain Service**: Verificação de transações
   - Endpoint: http://localhost:3002
   - API: `/api/v1/blockchain/verify` e `/api/v1/blockchain/{verification_id}`

3. **ZKP Service**: Geração e verificação de provas de conhecimento zero
   - Endpoint: http://localhost:3003
   - API: `/api/v1/zkp/generate` e `/api/v1/zkp/{proof_id}`

## Segurança

### Autenticação
- JWT (JSON Web Tokens) para autenticação entre serviços
- Middleware de autenticação em todas as APIs
- Chaves secretas gerenciadas via variáveis de ambiente

### Autorização
- RBAC (Role-Based Access Control) implementado via claims JWT
- Validação de escopo por endpoint

## Resiliência

### Rate Limiting
- Controle de taxa de requisições por endpoint
- Configuração flexível de limites por segundo
- Suporte a burst para picos de tráfego
- Resposta 429 (Too Many Requests) quando excedido

### Circuit Breaker
- Proteção contra falhas em cascata
- Estados: Fechado, Aberto e Meio-Aberto
- Configuração de threshold de falhas
- Timeout de reset automático
- Resposta 503 (Service Unavailable) quando aberto

### Retry Pattern
- Tentativas automáticas para falhas temporárias
- Backoff exponencial com jitter
- Configuração flexível de tentativas e delays
- Condições personalizáveis para retry

### Bulkhead Pattern
- Isolamento de falhas entre componentes
- Limite de concorrência por operação
- Timeout configurável
- Proteção contra sobrecarga de recursos

## Monitoramento

### Métricas (Prometheus)
- Tempo de geração de provas ZKP
- Tempo de análise de IA
- Latência de requisições HTTP
- Taxa de erros
- Conexões ativas
- Métricas de rate limiting
- Estado do circuit breaker
- Métricas de retry
- Métricas de bulkhead

### Visualização (Grafana)
- Dashboard em tempo real
- Métricas de performance
- Alertas configuráveis
- Histórico de eventos

## Requisitos

- Docker e Docker Compose
- Rust 1.75 ou superior (para desenvolvimento)
- PostgreSQL 16 (instalado automaticamente via Docker)
- Ollama com modelo Mistral (instalado automaticamente via Docker)

## Configuração

1. Clone o repositório:
```bash
git clone https://github.com/ibelieve/finance.git
cd finance
```

2. Copie o arquivo de exemplo de variáveis de ambiente:
```bash
cp .env.example .env
```

3. Edite o arquivo `.env` com suas configurações:
```env
# Configurações do Banco de Dados
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ibelieve_finance

# Configurações dos Serviços
AI_SERVICE_PORT=3001
BLOCKCHAIN_SERVICE_PORT=3002
ZKP_SERVICE_PORT=3003

# Configurações do Blockchain
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-project-id
ETHEREUM_CHAIN_ID=1

# Configurações do Ollama
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=mistral

# Configurações de Segurança
JWT_SECRET=your-secret-key

# Configurações de Log
RUST_LOG=info

# Configurações de Resiliência
RATE_LIMIT_RPS=100
RATE_LIMIT_BURST=150
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=30
RETRY_MAX_ATTEMPTS=3
RETRY_INITIAL_DELAY=100
RETRY_MAX_DELAY=5000
BULKHEAD_MAX_CONCURRENT=10
BULKHEAD_TIMEOUT=5000
```

## Execução

1. Inicie os serviços com Docker Compose:
```bash
docker-compose up -d
```

2. Verifique os logs:
```bash
docker-compose logs -f
```

3. Acesse os dashboards:
- Grafana: http://localhost:3000 (admin/admin)
- Prometheus: http://localhost:9090

## Desenvolvimento

1. Instale as dependências de desenvolvimento:
```bash
sudo apt-get update
sudo apt-get install -y build-essential pkg-config libssl-dev
```

2. Configure o ambiente de desenvolvimento:
```bash
cargo build
```

3. Execute os testes:
```bash
cargo test
```

4. Execute os serviços individualmente:
```bash
# AI Service
cargo run --bin ai-service

# Blockchain Service
cargo run --bin blockchain-service

# ZKP Service
cargo run --bin zkp-service
```

## Documentação da API

A documentação da API está disponível em:

- AI Service: http://localhost:3001/swagger-ui/
- Blockchain Service: http://localhost:3002/swagger-ui/
- ZKP Service: http://localhost:3003/swagger-ui/

## Performance

### Tempos de Resposta
- Geração de ZKP: < 3 segundos
- Análise de IA: < 2 segundos
- Verificação Blockchain: < 1 segundo

### Capacidade
- 500 TPS (Transações por Segundo)
- Escalável horizontalmente via Kubernetes
- Rate limiting: 100 req/s com burst de 150
- Circuit breaker: 5 falhas em 30 segundos
- Retry: 3 tentativas com backoff exponencial
- Bulkhead: 10 operações concorrentes por serviço

## Contribuição

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Crie um Pull Request

## Licença

Este projeto está licenciado sob a licença ISC - veja o arquivo [LICENSE](LICENSE) para mais detalhes. 