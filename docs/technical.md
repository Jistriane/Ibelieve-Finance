# Documentação Técnica - IbelieveFinance

## Smart Contracts

### ACMEToken (ACME tVFY)

#### Estruturas de Dados
```solidity
struct Subwallet {
    string name;
    bool isRegistered;
    uint256 lastActivity;
    uint256 registrationDate;
}
```

#### Eventos
```solidity
event TokensBurned(address indexed from, uint256 amount);
event TokensMinted(address indexed to, uint256 amount);
event SubwalletRegistered(address indexed wallet, string name);
event SubwalletRemoved(address indexed wallet);
event SubwalletUpdated(address indexed wallet, string newName);
```

#### Constantes
```solidity
uint256 public constant MAX_SUBWALLETS = 100;
```

#### Funções Principais

1. **Constructor**
```solidity
constructor() ERC20("ACME tVFY Token", "ACME")
```
- Cria token com supply inicial de 100 ACME
- Tokens são enviados para o deployer

2. **Gestão de Subwallets**
```solidity
function registerSubwallet(address wallet, string memory name) external onlyOwner
function removeSubwallet(address wallet) external onlyOwner
function updateSubwalletName(address wallet, string memory newName) external onlyOwner
function isSubwallet(address wallet) public view returns (bool)
```

3. **Operações com Tokens**
```solidity
function burn(uint256 amount) public virtual
function mint(address to, uint256 amount) public onlyOwner
```

4. **Controle de Pausa**
```solidity
function pause() public onlyOwner
function unpause() public onlyOwner
```

### ZKProofRegistry

#### Estruturas de Dados
```solidity
struct Proof {
    bytes32 proofHash;
    address verifier;
    uint256 timestamp;
    bool verified;
    uint256 tokenAmount;
    address subwallet;
}

struct Statistics {
    uint256 totalProofs;
    uint256 verifiedProofs;
    uint256 totalTokensBurned;
    uint256 activeSubwallets;
}
```

#### Eventos
```solidity
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

#### Constantes e Variáveis
```solidity
uint256 public PROOF_REGISTRATION_COST = 0.1 * 10**18;
uint256 public constant MAX_DISCOUNT = 30;
```

#### Funções Principais

1. **Constructor**
```solidity
constructor(address _acmeToken)
```
- Requer endereço válido do token ACME
- Configura interface do token

2. **Registro e Verificação**
```solidity
function registerProof(bytes32 proofHash) external onlySubwallet whenNotPaused
function verifyProof(bytes32 proofHash) external onlySubwallet whenNotPaused
```

3. **Consultas**
```solidity
function getProof(bytes32 proofHash) external view returns (Proof memory)
function getUserProofs(address user) external view returns (bytes32[] memory)
function getStatistics() external view returns (Statistics memory)
function getDiscountedCost(address subwallet) public view returns (uint256)
```

4. **Administrativas**
```solidity
function pause() external onlyOwner
function unpause() external onlyOwner
function updateRegistrationCost(uint256 newCost) external onlyOwner
function emergencyTokenRecovery(address token, uint256 amount) external onlyOwner
```

## Sistema de Descontos

### Cálculo de Desconto
```solidity
proofCount = número de provas da subwallet
discount = (proofCount > 10) ? 30 : (proofCount * 3)
discountAmount = (PROOF_REGISTRATION_COST * discount) / 100
finalCost = PROOF_REGISTRATION_COST - discountAmount
```

### Exemplos
1. Primeira prova:
   - Custo = 0.1 ACME
   - Desconto = 0%

2. Após 5 provas:
   - Custo = 0.085 ACME
   - Desconto = 15%

3. Após 10+ provas:
   - Custo = 0.07 ACME
   - Desconto = 30%

## Fluxo de Operações

### Registro de Prova
1. Subwallet gera hash da prova
2. Verifica saldo ACME suficiente
3. Calcula desconto aplicável
4. Queima tokens ACME
5. Registra prova
6. Emite evento

### Verificação de Prova
1. Subwallet solicita verificação
2. Sistema valida existência
3. Marca como verificada
4. Emite evento

## Segurança

### Controle de Acesso
- Funções administrativas: apenas owner
- Registro/verificação: apenas subwallets
- Pausa de emergência disponível

### Validações
- Endereços não-zero
- Nomes não vazios
- Saldos suficientes
- Estados válidos de provas

### Proteções
- Reentrancy guard implícito
- Limite de subwallets
- Recuperação de emergência

## Integração Frontend

### Web3Service
```typescript
class Web3Service {
    registerProof(proofHash: string): Promise<string>
    verifyProof(proofHash: string): Promise<boolean>
    getUserProofs(address: string): Promise<string[]>
    connectWallet(): Promise<string>
}
```

### ZKProofService
```typescript
interface ZKProof {
    id: string;
    transactionId: string;
    proof: string;
    verified: boolean;
    createdAt: string;
    blockchainTxHash?: string;
}

const zkProofAPI = {
    generateProof(transactionId: string): Promise<ZKProof>
    verifyProof(proofId: string): Promise<boolean>
    getProofsByTransaction(transactionId: string): Promise<ZKProof[]>
    getProofsByUser(address: string): Promise<ZKProof[]>
}
```

## Monitoramento

### Métricas Principais
1. Provas
   - Total registrado
   - Total verificado
   - Taxa de sucesso

2. Tokens
   - Total queimado
   - Média por prova
   - Descontos aplicados

3. Subwallets
   - Total ativo
   - Frequência de uso
   - Distribuição de provas

### Alertas
1. Críticos
   - Falhas em transações
   - Tentativas não autorizadas
   - Saldo ACME insuficiente

2. Warnings
   - Alto volume de provas
   - Subwallets inativas
   - Aproximação do limite 