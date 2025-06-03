# I Believe Finance - Smart Contracts

Este diretório contém os smart contracts da aplicação I Believe Finance, implementados em Solidity e utilizando o framework Hardhat para desenvolvimento, testes e deploy.

## Tecnologias

- Solidity 0.8.20
- Hardhat
- OpenZeppelin
- Ethers.js
- Waffle
- Chai
- TypeScript
- Solhint
- Prettier
- Slither

## Estrutura de Diretórios

```
smart-contracts/
├── contracts/
│   ├── core/
│   │   ├── Loan.sol
│   │   ├── RiskAnalysis.sol
│   │   └── ZKPVerifier.sol
│   ├── interfaces/
│   │   ├── ILoan.sol
│   │   ├── IRiskAnalysis.sol
│   │   └── IZKPVerifier.sol
│   ├── libraries/
│   │   ├── Math.sol
│   │   └── ZKPUtils.sol
│   └── mocks/
│       ├── MockToken.sol
│       └── MockZKP.sol
├── scripts/
│   ├── deploy.ts
│   └── verify.ts
├── test/
│   ├── Loan.test.ts
│   ├── RiskAnalysis.test.ts
│   └── ZKPVerifier.test.ts
├── hardhat.config.ts
├── .env-dev
├── .env-homolog
├── .env-prod
└── package.json
```

## Contratos

### Loan.sol
- Gerenciamento de empréstimos
- Validação de solicitações
- Execução de pagamentos
- Histórico de transações

### RiskAnalysis.sol
- Integração com oráculo de risco
- Validação de scores
- Ajuste de termos
- Recomendações

### ZKPVerifier.sol
- Verificação de provas zero-knowledge
- Validação de identidade
- Proteção de privacidade
- Integração com empréstimos

## Interfaces

### ILoan.sol
```solidity
interface ILoan {
    function requestLoan(uint256 amount, uint256 term) external;
    function approveLoan(uint256 loanId) external;
    function repayLoan(uint256 loanId) external;
    function getLoanDetails(uint256 loanId) external view returns (LoanDetails memory);
}
```

### IRiskAnalysis.sol
```solidity
interface IRiskAnalysis {
    function analyzeRisk(address borrower) external returns (uint256);
    function getRiskScore(address borrower) external view returns (uint256);
    function updateRiskFactors(address borrower, bytes calldata factors) external;
}
```

### IZKPVerifier.sol
```solidity
interface IZKPVerifier {
    function verifyProof(bytes calldata proof) external returns (bool);
    function generateProof(bytes calldata input) external returns (bytes memory);
    function validateIdentity(bytes calldata proof) external returns (bool);
}
```

## Bibliotecas

### Math.sol
- Operações matemáticas seguras
- Cálculos de juros
- Arredondamento
- Validações numéricas

### ZKPUtils.sol
- Utilitários para provas zero-knowledge
- Conversão de dados
- Validação de entradas
- Formatação de provas

## Testes

- Testes unitários com Waffle
- Testes de integração
- Cobertura de 100%
- Mocks para oráculos

## Ambiente de Desenvolvimento

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente:
```bash
cp .env-dev .env
```

3. Compilar contratos:
```bash
npx hardhat compile
```

4. Rodar testes:
```bash
npx hardhat test
```

5. Deploy local:
```bash
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost
```

## Deploy

### Testnet
```bash
npx hardhat run scripts/deploy.ts --network goerli
```

### Mainnet
```bash
npx hardhat run scripts/deploy.ts --network mainnet
```

## Verificação

Verificar contratos no Etherscan:
```bash
npx hardhat verify --network goerli <CONTRACT_ADDRESS>
```

## Segurança

- Auditorias de código
- Testes de penetração
- Análise estática com Slither
- Validação de entradas
- Proteção contra reentrância
- Controle de acesso
- Pausa de emergência
- Limites de valores
- Timeouts
- Eventos para rastreamento

## Gas Optimization

- Uso de uint256
- Packing de variáveis
- Otimização de loops
- Cálculos off-chain
- Batch operations
- Storage vs Memory
- Eventos indexados
- Funções view/pure
- Remoção de código morto

## Documentação

- NatSpec comments
- README detalhado
- Diagramas de fluxo
- Exemplos de uso
- Guias de integração
- Troubleshooting

## Contribuição

1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

MIT 