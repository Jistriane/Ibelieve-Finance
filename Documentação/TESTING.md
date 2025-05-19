# Estratégias de Teste - Ibelieve Finance

## 1. Visão Geral

Este documento descreve as estratégias de teste implementadas no Ibelieve Finance, cobrindo testes unitários, de integração, end-to-end e de segurança.

## 2. Testes Unitários

### 2.1 Frontend

```typescript
// frontend/src/components/__tests__/ProofGenerator.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProofGenerator } from '../ProofGenerator';

describe('ProofGenerator', () => {
    it('deve renderizar o formulário corretamente', () => {
        render(<ProofGenerator />);
        
        expect(screen.getByLabelText(/saldo/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/timestamp/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /gerar prova/i })).toBeInTheDocument();
    });

    it('deve validar campos obrigatórios', async () => {
        render(<ProofGenerator />);
        
        const submitButton = screen.getByRole('button', { name: /gerar prova/i });
        fireEvent.click(submitButton);
        
        expect(await screen.findByText(/saldo é obrigatório/i)).toBeInTheDocument();
        expect(await screen.findByText(/timestamp é obrigatório/i)).toBeInTheDocument();
    });

    it('deve chamar onSubmit com dados válidos', async () => {
        const mockOnSubmit = jest.fn();
        render(<ProofGenerator onSubmit={mockOnSubmit} />);
        
        fireEvent.change(screen.getByLabelText(/saldo/i), {
            target: { value: '1000' }
        });
        
        fireEvent.change(screen.getByLabelText(/timestamp/i), {
            target: { value: '2024-03-24T12:00:00' }
        });
        
        fireEvent.click(screen.getByRole('button', { name: /gerar prova/i }));
        
        expect(mockOnSubmit).toHaveBeenCalledWith({
            balance: 1000,
            timestamp: '2024-03-24T12:00:00'
        });
    });
});
```

### 2.2 Backend

```typescript
// backend/src/services/__tests__/proof.service.test.ts
import { ProofService } from '../proof.service';
import { ethers } from 'ethers';
import { mock, MockProxy } from 'jest-mock-extended';

describe('ProofService', () => {
    let service: ProofService;
    let mockProvider: MockProxy<ethers.providers.Provider>;
    let mockContract: MockProxy<ethers.Contract>;

    beforeEach(() => {
        mockProvider = mock<ethers.providers.Provider>();
        mockContract = mock<ethers.Contract>();
        
        service = new ProofService(mockProvider);
    });

    it('deve gerar prova com sucesso', async () => {
        const data = {
            balance: 1000,
            timestamp: Math.floor(Date.now() / 1000)
        };

        const result = await service.generateAndSubmitProof(data);

        expect(result).toHaveProperty('proofHash');
        expect(result).toHaveProperty('txHash');
        expect(result.status).toBe('submitted');
    });

    it('deve verificar prova com sucesso', async () => {
        const proofHash = '0x123';
        mockContract.getProof.mockResolvedValue({ verified: true });

        const result = await service.verifyProof(proofHash);

        expect(result).toBe(true);
    });
});
```

### 2.3 Smart Contracts

```solidity
// test/ProofManager.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProofManager", function () {
    let proofManager;
    let verifier;
    let owner;
    let user;

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();

        const Verifier = await ethers.getContractFactory("SolvencyVerifier");
        verifier = await Verifier.deploy(/* parâmetros do verifier */);
        await verifier.deployed();

        const ProofManager = await ethers.getContractFactory("ProofManager");
        proofManager = await ProofManager.deploy(verifier.address);
        await proofManager.deployed();
    });

    it("deve permitir submeter uma prova", async function () {
        const proofHash = ethers.utils.keccak256("0x123");
        const balance = 1000;
        const timestamp = Math.floor(Date.now() / 1000);

        await expect(proofManager.submitProof(proofHash, balance, timestamp))
            .to.emit(proofManager, "ProofSubmitted")
            .withArgs(proofHash, owner.address, balance, timestamp);

        expect(await proofManager.usedProofs(proofHash)).to.be.true;
    });

    it("não deve permitir reutilizar uma prova", async function () {
        const proofHash = ethers.utils.keccak256("0x123");
        const balance = 1000;
        const timestamp = Math.floor(Date.now() / 1000);

        await proofManager.submitProof(proofHash, balance, timestamp);

        await expect(
            proofManager.submitProof(proofHash, balance, timestamp)
        ).to.be.revertedWith("Proof already used");
    });
});
```

## 3. Testes de Integração

### 3.1 API

```typescript
// backend/src/__tests__/api/proof.test.ts
import request from 'supertest';
import { app } from '../../app';
import { ProofService } from '../../services/proof.service';
import { mock, MockProxy } from 'jest-mock-extended';

describe('Proof API', () => {
    let mockProofService: MockProxy<ProofService>;

    beforeEach(() => {
        mockProofService = mock<ProofService>();
        app.locals.proofService = mockProofService;
    });

    it('deve gerar prova com sucesso', async () => {
        const data = {
            balance: 1000,
            timestamp: Math.floor(Date.now() / 1000)
        };

        mockProofService.generateAndSubmitProof.mockResolvedValue({
            proofHash: '0x123',
            txHash: '0x456',
            status: 'submitted'
        });

        const response = await request(app)
            .post('/api/proofs/generate')
            .send(data);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('proofHash');
        expect(response.body).toHaveProperty('txHash');
    });

    it('deve retornar erro com dados inválidos', async () => {
        const data = {
            balance: -1000,
            timestamp: 'invalid'
        };

        const response = await request(app)
            .post('/api/proofs/generate')
            .send(data);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });
});
```

### 3.2 Blockchain

```typescript
// backend/src/__tests__/integration/blockchain.test.ts
import { ethers } from 'ethers';
import { ProofService } from '../../services/proof.service';
import { ProofManager } from '../../contracts/ProofManager';

describe('Blockchain Integration', () => {
    let provider: ethers.providers.JsonRpcProvider;
    let proofService: ProofService;
    let proofManager: ethers.Contract;

    before(async () => {
        provider = new ethers.providers.JsonRpcProvider(process.env.TEST_RPC_URL);
        proofService = new ProofService(provider);
        
        const ProofManager = await ethers.getContractFactory('ProofManager');
        proofManager = await ProofManager.deploy(/* parâmetros */);
        await proofManager.deployed();
    });

    it('deve gerar e verificar prova na blockchain', async () => {
        const data = {
            balance: 1000,
            timestamp: Math.floor(Date.now() / 1000)
        };

        const result = await proofService.generateAndSubmitProof(data);
        expect(result.status).toBe('submitted');

        const proof = await proofManager.getProof(result.proofHash);
        expect(proof.verified).toBe(true);
    });
});
```

## 4. Testes End-to-End

### 4.1 Fluxo Completo

```typescript
// e2e/proof.test.ts
import { test, expect } from '@playwright/test';

test('fluxo completo de geração e verificação de prova', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Navega para página de provas
    await page.goto('/proofs');
    await expect(page.locator('[data-testid="proof-list"]')).toBeVisible();

    // Gera nova prova
    await page.click('[data-testid="new-proof-button"]');
    await page.fill('[data-testid="balance-input"]', '1000');
    await page.fill('[data-testid="timestamp-input"]', '2024-03-24T12:00:00');
    await page.click('[data-testid="generate-button"]');

    // Verifica status
    await expect(page.locator('[data-testid="proof-status"]')).toHaveText('submitted');

    // Aguarda verificação
    await expect(page.locator('[data-testid="proof-status"]')).toHaveText('verified', {
        timeout: 30000
    });
});
```

### 4.2 Testes de Performance

```typescript
// e2e/performance.test.ts
import { test, expect } from '@playwright/test';

test('performance de geração de prova', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/proofs/new');
    await page.fill('[data-testid="balance-input"]', '1000');
    await page.fill('[data-testid="timestamp-input"]', '2024-03-24T12:00:00');
    await page.click('[data-testid="generate-button"]');

    await expect(page.locator('[data-testid="proof-status"]')).toHaveText('submitted');

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(5000); // Deve completar em menos de 5 segundos
});
```

## 5. Testes de Segurança

### 5.1 Testes de Penetração

```typescript
// security/penetration.test.ts
import { test, expect } from '@playwright/test';

test('deve prevenir injeção SQL', async ({ page }) => {
    await page.goto('/proofs');
    await page.fill('[data-testid="search-input"]', "'; DROP TABLE proofs; --");
    await page.click('[data-testid="search-button"]');

    // Verifica se a tabela ainda existe
    const proofs = await page.locator('[data-testid="proof-list"]').count();
    expect(proofs).toBeGreaterThan(0);
});

test('deve prevenir XSS', async ({ page }) => {
    await page.goto('/proofs');
    await page.fill('[data-testid="search-input"]', '<script>alert("xss")</script>');
    await page.click('[data-testid="search-button"]');

    // Verifica se o script não foi executado
    const alerts = await page.evaluate(() => window.alert);
    expect(alerts).toBeUndefined();
});
```

### 5.2 Testes de Autenticação

```typescript
// security/auth.test.ts
import { test, expect } from '@playwright/test';

test('deve exigir autenticação', async ({ page }) => {
    await page.goto('/proofs');
    await expect(page).toHaveURL('/login');
});

test('deve prevenir acesso não autorizado', async ({ page }) => {
    // Login como usuário normal
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'user@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Tenta acessar área administrativa
    await page.goto('/admin');
    await expect(page).toHaveURL('/unauthorized');
});
```

## 6. Cobertura de Testes

### 6.1 Configuração

```javascript
// jest.config.js
module.exports = {
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    coverageReporters: ['text', 'lcov', 'html'],
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
```

### 6.2 Scripts

```json
{
    "scripts": {
        "test": "jest",
        "test:watch": "jest --watch",
        "test:coverage": "jest --coverage",
        "test:e2e": "playwright test",
        "test:security": "jest security"
    }
}
```

## 7. CI/CD

### 7.1 Pipeline de Testes

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'

    - name: Install dependencies
      run: npm ci

    - name: Run unit tests
      run: npm test

    - name: Run integration tests
      run: npm run test:integration

    - name: Run e2e tests
      run: npm run test:e2e

    - name: Run security tests
      run: npm run test:security

    - name: Upload coverage
      uses: codecov/codecov-action@v2
```

## 8. Referências

- [Jest Documentation](https://jestjs.io/docs)
- [Playwright Documentation](https://playwright.dev/docs)
- [Hardhat Testing](https://hardhat.org/tutorial/testing-contracts)
- [SnarkJS Testing](https://github.com/iden3/snarkjs) 