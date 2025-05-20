# Desenvolvimento - Ibelieve Finance

## 1. Configuração do Ambiente

### 1.1 Pré-requisitos

- Node.js 18+
- Docker
- Git
- PostgreSQL 14+
- Redis 6+
- MetaMask

### 1.2 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/ibelieve/finance.git
cd finance
```

2. Instale as dependências:
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. Configure as variáveis de ambiente:
```bash
# Frontend
cp .env.example .env

# Backend
cp .env.example .env
```

4. Inicie os serviços:
```bash
# Desenvolvimento
docker-compose -f docker-compose.dev.yml up -d

# Ou individualmente
# Frontend
cd frontend
npm run dev

# Backend
cd backend
npm run dev
```

## 2. Estrutura do Projeto

### 2.1 Frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── forms/
│   │   └── layout/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   ├── store/
│   └── tests/
├── public/
└── package.json
```

### 2.2 Backend

```
backend/
├── src/
│   ├── config/
│   ├── models/
│   ├── services/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── utils/
│   ├── types/
│   └── tests/
└── package.json
```

## 3. Padrões de Código

### 3.1 TypeScript

```typescript
// Interfaces
interface Proof {
  id: string;
  userId: string;
  balance: number;
  timestamp: Date;
  status: ProofStatus;
}

// Types
type ProofStatus = 'pending' | 'verified' | 'rejected';

// Enums
enum ErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND'
}
```

### 3.2 React Components

```typescript
// Componente funcional com hooks
import React, { useState, useEffect } from 'react';
import { useProof } from '../hooks/useProof';

interface ProofFormProps {
  onSubmit: (data: ProofData) => void;
}

export const ProofForm: React.FC<ProofFormProps> = ({ onSubmit }) => {
  const [balance, setBalance] = useState<number>(0);
  const { generateProof, loading } = useProof();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const proof = await generateProof(balance);
    onSubmit(proof);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={balance}
        onChange={(e) => setBalance(Number(e.target.value))}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Gerando...' : 'Gerar Prova'}
      </button>
    </form>
  );
};
```

### 3.3 Backend Services

```typescript
// Service com injeção de dependência
import { injectable, inject } from 'inversify';
import { ProofRepository } from '../repositories/ProofRepository';
import { BlockchainService } from './BlockchainService';

@injectable()
export class ProofService {
  constructor(
    @inject('ProofRepository') private proofRepository: ProofRepository,
    @inject('BlockchainService') private blockchainService: BlockchainService
  ) {}

  async createProof(data: ProofData): Promise<Proof> {
    const proof = await this.proofRepository.create(data);
    await this.blockchainService.verifyProof(proof);
    return proof;
  }
}
```

## 4. Testes

### 4.1 Frontend

```typescript
// Teste de componente
import { render, screen, fireEvent } from '@testing-library/react';
import { ProofForm } from './ProofForm';

describe('ProofForm', () => {
  it('should submit proof data', async () => {
    const onSubmit = jest.fn();
    render(<ProofForm onSubmit={onSubmit} />);

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '1000' } });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onSubmit).toHaveBeenCalledWith({
      balance: 1000,
      timestamp: expect.any(Date)
    });
  });
});
```

### 4.2 Backend

```typescript
// Teste de serviço
import { ProofService } from './ProofService';
import { ProofRepository } from '../repositories/ProofRepository';
import { BlockchainService } from './BlockchainService';

describe('ProofService', () => {
  let proofService: ProofService;
  let proofRepository: jest.Mocked<ProofRepository>;
  let blockchainService: jest.Mocked<BlockchainService>;

  beforeEach(() => {
    proofRepository = {
      create: jest.fn(),
      findById: jest.fn()
    };
    blockchainService = {
      verifyProof: jest.fn()
    };
    proofService = new ProofService(proofRepository, blockchainService);
  });

  it('should create and verify proof', async () => {
    const proofData = { balance: 1000 };
    const proof = { id: '1', ...proofData };

    proofRepository.create.mockResolvedValue(proof);
    blockchainService.verifyProof.mockResolvedValue(true);

    const result = await proofService.createProof(proofData);

    expect(result).toEqual(proof);
    expect(proofRepository.create).toHaveBeenCalledWith(proofData);
    expect(blockchainService.verifyProof).toHaveBeenCalledWith(proof);
  });
});
```

## 5. Git Workflow

### 5.1 Branches

- `main`: Produção
- `develop`: Desenvolvimento
- `feature/*`: Novas funcionalidades
- `bugfix/*`: Correções de bugs
- `hotfix/*`: Correções urgentes

### 5.2 Commits

```
feat: adiciona geração de provas de solvência
fix: corrige validação de saldo
docs: atualiza README
style: formata código
refactor: extrai lógica de verificação
test: adiciona testes de integração
chore: atualiza dependências
```

### 5.3 Pull Requests

1. Crie uma branch a partir de `develop`
2. Desenvolva a funcionalidade
3. Escreva testes
4. Atualize documentação
5. Crie PR para `develop`
6. Aguarde revisão
7. Resolva conflitos
8. Merge após aprovação

## 6. Debugging

### 6.1 Frontend

- React Developer Tools
- Redux DevTools
- Chrome DevTools
- Console logging
- Error boundaries

### 6.2 Backend

- VS Code debugger
- Node.js inspector
- Winston logging
- Postman/Insomnia
- Database queries

## 7. Performance

### 7.1 Frontend

- Code splitting
- Lazy loading
- Memoização
- Virtualização
- Caching

### 7.2 Backend

- Caching com Redis
- Rate limiting
- Query optimization
- Connection pooling
- Load balancing

## 8. Segurança

### 8.1 Frontend

- Sanitização de input
- Proteção XSS
- CSRF tokens
- Content Security Policy
- HTTPS

### 8.2 Backend

- Validação de dados
- Autenticação JWT
- Rate limiting
- SQL injection prevention
- CORS

## 9. Referências

- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [Node.js Documentation](https://nodejs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Redis Documentation](https://redis.io/documentation) 