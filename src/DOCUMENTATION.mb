# Documentação Técnica - Ibelieve Finance

## Índice
1. [Arquitetura do Sistema](#arquitetura-do-sistema)
2. [Microserviços](#microserviços)
3. [APIs](#apis)
4. [Banco de Dados](#banco-de-dados)
5. [Segurança](#segurança)
6. [Monitoramento](#monitoramento)
7. [Desenvolvimento](#desenvolvimento)
8. [Deploy](#deploy)

## Arquitetura do Sistema

### Visão Geral
O sistema é composto por três microserviços principais:
- Blockchain Service
- User Service
- ZKP Service

### Diagrama de Arquitetura
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Blockchain     │     │     User        │     │      ZKP        │
│    Service      │◄────┤     Service     │────►│     Service     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                       ▲                       ▲
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Blockchain    │     │    Database     │     │    ZKP Circuit  │
│    Network      │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Microserviços

### Blockchain Service
- **Porta**: 8084
- **Responsabilidade**: Verificação de transações blockchain
- **Tecnologias**: Rust, Actix-web
- **Dependências**:
  - common
  - actix-web
  - utoipa
  - serde

### User Service
- **Porta**: 8085
- **Responsabilidade**: Gerenciamento de usuários
- **Tecnologias**: Rust, Actix-web
- **Dependências**:
  - common
  - actix-web
  - utoipa
  - serde
  - uuid

### ZKP Service
- **Porta**: 8082
- **Responsabilidade**: Geração e verificação de provas ZKP
- **Tecnologias**: Rust, Actix-web
- **Dependências**:
  - common
  - actix-web
  - utoipa
  - serde

## APIs

### Blockchain Service API

#### POST /api/blockchain/verify-assets
```rust
Request:
{
    "verified": bool,
    "timestamp": DateTime<Utc>,
    "transaction_hash": Option<String>
}

Response:
{
    "verified": bool,
    "timestamp": DateTime<Utc>,
    "transaction_hash": String
}
```

#### GET /api/blockchain/verify-transaction/{tx_hash}
```rust
Response:
{
    "verified": bool,
    "timestamp": DateTime<Utc>,
    "transaction_hash": String
}
```

### User Service API

#### GET /api/users/{user_id}
```rust
Response:
{
    "id": Uuid,
    "wallet_address": String,
    "created_at": DateTime<Utc>,
    "updated_at": DateTime<Utc>
}
```

#### POST /api/users
```rust
Request:
{
    "wallet_address": String,
    "created_at": DateTime<Utc>,
    "updated_at": DateTime<Utc>
}

Response:
{
    "id": Uuid,
    "wallet_address": String,
    "created_at": DateTime<Utc>,
    "updated_at": DateTime<Utc>
}
```

#### PUT /api/users/{user_id}
```rust
Request:
{
    "wallet_address": String,
    "updated_at": DateTime<Utc>
}

Response:
{
    "id": Uuid,
    "wallet_address": String,
    "created_at": DateTime<Utc>,
    "updated_at": DateTime<Utc>
}
```

### ZKP Service API

#### POST /api/zkp/generate
```rust
Request:
{
    "proof": String,
    "public_inputs": Vec<String>,
    "verification_key": String
}

Response:
{
    "proof": String,
    "public_inputs": Vec<String>,
    "verification_key": String
}
```

#### POST /api/zkp/verify
```rust
Request:
{
    "proof": String,
    "public_inputs": Vec<String>,
    "verification_key": String
}

Response:
{
    "verified": bool
}
```

## Banco de Dados

### Estrutura

#### Tabela: users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

#### Tabela: blockchain_verifications
```sql
CREATE TABLE blockchain_verifications (
    id UUID PRIMARY KEY,
    transaction_hash VARCHAR(66) NOT NULL UNIQUE,
    verified BOOLEAN NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

#### Tabela: zkp_proofs
```sql
CREATE TABLE zkp_proofs (
    id UUID PRIMARY KEY,
    proof TEXT NOT NULL,
    public_inputs JSONB NOT NULL,
    verification_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

## Segurança

### Autenticação
- JWT (JSON Web Tokens)
- Expiração de tokens
- Refresh tokens

### Autorização
- RBAC (Role-Based Access Control)
- Permissões por endpoint
- Validação de escopo

### Proteção de Dados
- Criptografia em trânsito (HTTPS)
- Criptografia em repouso
- Sanitização de inputs
- Validação de dados

### Rate Limiting
- Limite por IP
- Limite por usuário
- Limite por endpoint

## Monitoramento

### Métricas
- Latência de requisições
- Taxa de erros
- Uso de recursos
- Tempo de resposta

### Logs
- Nível: INFO, WARN, ERROR
- Formato: JSON
- Rotação de logs
- Retenção configurável

### Alertas
- Latência alta
- Taxa de erro elevada
- Uso de recursos crítico
- Falhas de serviço

## Desenvolvimento

### Estrutura de Diretórios

#### Backend
```
backend/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── services/
│   ├── routes/
│   ├── config/
│   ├── utils/
│   └── app.ts
├── tests/
├── .env-dev
├── .env-homolog
├── .env-prod
├── package.json
└── tsconfig.json
```

#### Frontend
```
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── contexts/
│   ├── utils/
│   └── App.tsx
├── public/
├── tests/
├── .env-dev
├── .env-homolog
├── .env-prod
├── package.json
└── tsconfig.json
```

#### Microserviços
```
hasher/
├── services/
│   ├── blockchain/
│   ├── user/
│   └── zkp/
├── common/
└── Cargo.toml
```

### Ambiente de Desenvolvimento

#### Backend (Node.js)
```bash
# Instalar dependências
cd backend
npm install

# Desenvolvimento
npm run dev

# Testes
npm test
npm run test:watch

# Build
npm run build
```

#### Frontend (React)
```bash
# Instalar dependências
cd frontend
npm install

# Desenvolvimento
npm start

# Testes
npm test
npm run test:watch

# Build
npm run build
```

#### Microserviços (Rust)
```bash
# Instalar Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Build dos serviços
cd hasher
cargo build

# Executar serviços
cargo run -p blockchain-service
cargo run -p user-service
cargo run -p zkp-service
```

#### Variáveis de Ambiente
```bash
# Backend (.env-dev)
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/ibelieve
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379

# Frontend (.env-dev)
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:3000
REACT_APP_ENV=development

# Microserviços (.env-dev)
BLOCKCHAIN_SERVICE_PORT=8084
USER_SERVICE_PORT=8085
ZKP_SERVICE_PORT=8082
DATABASE_URL=postgresql://user:password@localhost:5432/ibelieve
```

### Convenções de Código
- Rust Style Guide
- Documentação de funções
- Testes unitários
- Testes de integração

### CI/CD
- GitHub Actions
- Testes automatizados
- Linting
- Build
- Deploy

## Deploy

### Requisitos
- Docker
- Docker Compose
- PostgreSQL
- Redis

### Configuração
```bash
# Variáveis de ambiente
cp .env-prod .env

# Build das imagens
docker-compose build

# Iniciar serviços
docker-compose up -d
```

### Monitoramento em Produção
- Grafana Dashboards
- Prometheus Alertas
- Logs centralizados
- Métricas de performance

### Backup
- Backup diário do banco
- Retenção de 30 dias
- Restauração automatizada
- Testes de recuperação

## Troubleshooting

### Problemas Comuns
1. Serviço não inicia
   - Verificar logs
   - Verificar portas
   - Verificar dependências

2. Erros de conexão
   - Verificar rede
   - Verificar firewall
   - Verificar configurações

3. Problemas de performance
   - Verificar recursos
   - Verificar queries
   - Verificar cache

### Logs e Debug
```bash
# Ver logs do serviço
docker logs -f service-name

# Ver métricas
curl http://localhost:9090/metrics

# Verificar saúde
curl http://localhost:8084/health
```

## Suporte

### Canais de Suporte
- GitHub Issues
- Email: suporte@ibelieve.finance
- Discord: [Link do Discord]

### SLA
- Disponibilidade: 99.9%
- Tempo de resposta: 4 horas
- Resolução: 24 horas 