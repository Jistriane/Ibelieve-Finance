# I Believe Finance - Backend

Este é o backend da aplicação I Believe Finance, responsável por processar solicitações de empréstimo, integrar com IA local para análise de risco e gerenciar provas zero-knowledge.

## Tecnologias

- Node.js 18
- TypeScript
- Express
- Prisma
- PostgreSQL
- Redis
- Jest
- Supertest
- ESLint
- Prettier
- Docker
- Nginx

## Estrutura de Diretórios

```
backend/
├── src/
│   ├── controllers/
│   │   ├── loan.controller.ts
│   │   ├── risk.controller.ts
│   │   └── zkp.controller.ts
│   ├── services/
│   │   ├── loan.service.ts
│   │   ├── risk.service.ts
│   │   └── zkp.service.ts
│   ├── models/
│   │   └── prisma/
│   │       └── schema.prisma
│   ├── routes/
│   │   ├── loan.routes.ts
│   │   ├── risk.routes.ts
│   │   └── zkp.routes.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── utils/
│   │   ├── ollama.ts
│   │   ├── web3.ts
│   │   └── zkp.ts
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── app.ts
│   ├── types/
│   │   └── index.ts
│   └── app.ts
├── tests/
├── k8s/
├── .env-dev
├── .env-homolog
├── .env-prod
├── package.json
├── tsconfig.json
├── Dockerfile.dev
├── Dockerfile.prod
├── docker-compose.yml
└── nginx.conf
```

## Funcionalidades

### Análise de Risco
- Integração com Ollama para IA local
- Processamento de dados do solicitante
- Geração de score de risco
- Recomendações personalizadas

### Empréstimos
- Validação de solicitações
- Integração com blockchain
- Gerenciamento de contratos
- Histórico de transações

### Zero-Knowledge Proofs
- Geração de provas
- Verificação de provas
- Integração com smart contracts
- Proteção de dados sensíveis

## API

### Endpoints

#### Empréstimos
- `POST /api/loans`: Criar solicitação
- `GET /api/loans`: Listar solicitações
- `GET /api/loans/:id`: Detalhes da solicitação
- `PUT /api/loans/:id`: Atualizar solicitação
- `DELETE /api/loans/:id`: Cancelar solicitação

#### Análise de Risco
- `POST /api/risk/analyze`: Analisar solicitação
- `GET /api/risk/scores`: Listar scores
- `GET /api/risk/recommendations`: Obter recomendações

#### ZKP
- `POST /api/zkp/generate`: Gerar prova
- `POST /api/zkp/verify`: Verificar prova
- `GET /api/zkp/status`: Status da prova

## Banco de Dados

### Schema

```prisma
model Loan {
  id          String   @id @default(uuid())
  amount      Decimal
  term        Int
  status      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String
  riskScore   Float?
  zkpProof    String?
}

model RiskAnalysis {
  id          String   @id @default(uuid())
  loanId      String
  score       Float
  factors     Json
  createdAt   DateTime @default(now())
}

model ZKPProof {
  id          String   @id @default(uuid())
  loanId      String
  proof       String
  verified    Boolean
  createdAt   DateTime @default(now())
}
```

## Cache

Redis é utilizado para:

- Cache de resultados de análise de risco
- Rate limiting
- Sessões
- Filas de processamento

## Testes

- Testes unitários com Jest
- Testes de integração com Supertest
- Cobertura mínima de 80%
- Mocks para Ollama e Web3

## Ambiente de Desenvolvimento

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente:
```bash
cp .env-dev .env
```

3. Iniciar banco de dados:
```bash
docker-compose up -d postgres redis
```

4. Executar migrações:
```bash
npx prisma migrate dev
```

5. Iniciar em modo desenvolvimento:
```bash
npm run dev
```

6. Rodar testes:
```bash
npm test
```

## Docker

### Desenvolvimento
```bash
docker-compose up
```

### Produção
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Kubernetes

Ver documentação em `k8s/README.md` para detalhes sobre:

- Deploy
- Observabilidade
- Backup
- Resource Quotas
- Namespaces

## Segurança

- Autenticação JWT
- Rate limiting
- Validação de entrada
- Sanitização de dados
- CORS configurado
- HTTPS em produção
- Headers de segurança
- Proteção contra injeção SQL
- Logging de segurança

## Performance

- Cache em múltiplas camadas
- Compressão Gzip
- Connection pooling
- Query optimization
- Indexação adequada
- Load balancing
- Auto-scaling

## Monitoramento

- Métricas de aplicação
- Logs estruturados
- Traces distribuídos
- Alertas configurados
- Dashboards Grafana
- Health checks

## Contribuição

1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

MIT 