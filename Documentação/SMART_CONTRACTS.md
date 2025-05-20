# Smart Contracts - Ibelieve Finance

## 1. Visão Geral

Os smart contracts do Ibelieve Finance são responsáveis pela verificação e armazenamento de provas de solvência na blockchain Ethereum. Utilizamos zero-knowledge proofs (zk-SNARKs) para garantir privacidade e eficiência nas verificações.

## 2. Contratos Principais

### 2.1 SolvencyVerifier

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SolvencyVerifier is Ownable, ReentrancyGuard {
    struct Proof {
        bytes32 proofHash;
        uint256 balance;
        uint256 timestamp;
        bool verified;
    }

    mapping(bytes32 => Proof) public proofs;
    
    event ProofVerified(bytes32 indexed proofHash, uint256 balance);
    event ProofRejected(bytes32 indexed proofHash, string reason);

    function verifyProof(
        bytes32 proofHash,
        uint256 balance,
        uint256 timestamp,
        bytes calldata signature
    ) external nonReentrant returns (bool) {
        require(!proofs[proofHash].verified, "Proof already verified");
        
        if (verifySignature(proofHash, signature)) {
            proofs[proofHash] = Proof(proofHash, balance, timestamp, true);
            emit ProofVerified(proofHash, balance);
            return true;
        }
        
        emit ProofRejected(proofHash, "Invalid signature");
        return false;
    }

    function verifySignature(
        bytes32 proofHash,
        bytes calldata signature
    ) internal view returns (bool) {
        bytes32 messageHash = keccak256(
            abi.encodePacked(proofHash)
        );
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        address signer = ecrecover(ethSignedMessageHash, v, r, s);
        
        return signer == owner();
    }

    function splitSignature(
        bytes calldata signature
    ) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(signature.length == 65, "Invalid signature length");
        
        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }
    }
}
```

### 2.2 SolvencyManager

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./SolvencyVerifier.sol";

contract SolvencyManager is Ownable, ReentrancyGuard {
    SolvencyVerifier public verifier;
    
    struct ProofSubmission {
        bytes32 proofHash;
        uint256 balance;
        uint256 timestamp;
        address submitter;
        bool verified;
    }
    
    mapping(bytes32 => ProofSubmission) public submissions;
    
    event ProofSubmitted(
        bytes32 indexed proofHash,
        address indexed submitter,
        uint256 balance
    );
    event ProofStatusUpdated(
        bytes32 indexed proofHash,
        bool verified
    );
    
    constructor(address _verifier) {
        verifier = SolvencyVerifier(_verifier);
    }
    
    function submitProof(
        bytes32 proofHash,
        uint256 balance,
        uint256 timestamp
    ) external nonReentrant {
        require(!submissions[proofHash].verified, "Proof already submitted");
        
        submissions[proofHash] = ProofSubmission(
            proofHash,
            balance,
            timestamp,
            msg.sender,
            false
        );
        
        emit ProofSubmitted(proofHash, msg.sender, balance);
    }
    
    function verifySubmission(
        bytes32 proofHash,
        bytes calldata signature
    ) external nonReentrant onlyOwner {
        ProofSubmission storage submission = submissions[proofHash];
        require(submission.submitter != address(0), "Proof not submitted");
        require(!submission.verified, "Proof already verified");
        
        bool verified = verifier.verifyProof(
            proofHash,
            submission.balance,
            submission.timestamp,
            signature
        );
        
        submission.verified = verified;
        emit ProofStatusUpdated(proofHash, verified);
    }
}
```

## 3. Interfaces

### 3.1 ISolvencyVerifier

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISolvencyVerifier {
    struct Proof {
        bytes32 proofHash;
        uint256 balance;
        uint256 timestamp;
        bool verified;
    }
    
    function verifyProof(
        bytes32 proofHash,
        uint256 balance,
        uint256 timestamp,
        bytes calldata signature
    ) external returns (bool);
    
    function proofs(bytes32) external view returns (
        bytes32 proofHash,
        uint256 balance,
        uint256 timestamp,
        bool verified
    );
}
```

### 3.2 ISolvencyManager

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISolvencyManager {
    struct ProofSubmission {
        bytes32 proofHash;
        uint256 balance;
        uint256 timestamp;
        address submitter;
        bool verified;
    }
    
    function submitProof(
        bytes32 proofHash,
        uint256 balance,
        uint256 timestamp
    ) external;
    
    function verifySubmission(
        bytes32 proofHash,
        bytes calldata signature
    ) external;
    
    function submissions(bytes32) external view returns (
        bytes32 proofHash,
        uint256 balance,
        uint256 timestamp,
        address submitter,
        bool verified
    );
}
```

## 4. Bibliotecas

### 4.1 SafeMath

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }
    
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath: subtraction overflow");
        uint256 c = a - b;
        return c;
    }
    
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");
        return c;
    }
    
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0, "SafeMath: division by zero");
        uint256 c = a / b;
        return c;
    }
}
```

## 5. Testes

### 5.1 Testes Unitários

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../contracts/SolvencyVerifier.sol";

contract SolvencyVerifierTest is Test {
    SolvencyVerifier verifier;
    address owner;
    address user;
    
    function setUp() public {
        owner = address(this);
        user = address(0x1);
        verifier = new SolvencyVerifier();
    }
    
    function testVerifyProof() public {
        bytes32 proofHash = keccak256("test");
        uint256 balance = 1000;
        uint256 timestamp = block.timestamp;
        
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            owner,
            keccak256(abi.encodePacked(proofHash))
        );
        bytes memory signature = abi.encodePacked(r, s, v);
        
        bool verified = verifier.verifyProof(
            proofHash,
            balance,
            timestamp,
            signature
        );
        
        assertTrue(verified);
        assertTrue(verifier.proofs(proofHash).verified);
    }
    
    function testRejectInvalidProof() public {
        bytes32 proofHash = keccak256("test");
        uint256 balance = 1000;
        uint256 timestamp = block.timestamp;
        
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            user,
            keccak256(abi.encodePacked(proofHash))
        );
        bytes memory signature = abi.encodePacked(r, s, v);
        
        bool verified = verifier.verifyProof(
            proofHash,
            balance,
            timestamp,
            signature
        );
        
        assertFalse(verified);
        assertFalse(verifier.proofs(proofHash).verified);
    }
}
```

### 5.2 Testes de Integração

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../contracts/SolvencyManager.sol";
import "../contracts/SolvencyVerifier.sol";

contract SolvencyManagerTest is Test {
    SolvencyVerifier verifier;
    SolvencyManager manager;
    address owner;
    address user;
    
    function setUp() public {
        owner = address(this);
        user = address(0x1);
        verifier = new SolvencyVerifier();
        manager = new SolvencyManager(address(verifier));
    }
    
    function testSubmitAndVerifyProof() public {
        bytes32 proofHash = keccak256("test");
        uint256 balance = 1000;
        uint256 timestamp = block.timestamp;
        
        vm.prank(user);
        manager.submitProof(proofHash, balance, timestamp);
        
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            owner,
            keccak256(abi.encodePacked(proofHash))
        );
        bytes memory signature = abi.encodePacked(r, s, v);
        
        manager.verifySubmission(proofHash, signature);
        
        (
            bytes32 storedHash,
            uint256 storedBalance,
            uint256 storedTimestamp,
            address submitter,
            bool verified
        ) = manager.submissions(proofHash);
        
        assertEq(storedHash, proofHash);
        assertEq(storedBalance, balance);
        assertEq(storedTimestamp, timestamp);
        assertEq(submitter, user);
        assertTrue(verified);
    }
}
```

## 6. Deployment

### 6.1 Scripts de Deployment

```javascript
// scripts/deploy.js
const hre = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Deploy SolvencyVerifier
    const SolvencyVerifier = await hre.ethers.getContractFactory("SolvencyVerifier");
    const verifier = await SolvencyVerifier.deploy();
    await verifier.deployed();
    console.log("SolvencyVerifier deployed to:", verifier.address);

    // Deploy SolvencyManager
    const SolvencyManager = await hre.ethers.getContractFactory("SolvencyManager");
    const manager = await SolvencyManager.deploy(verifier.address);
    await manager.deployed();
    console.log("SolvencyManager deployed to:", manager.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

### 6.2 Configuração do Hardhat

```javascript
// hardhat.config.js
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

module.exports = {
    solidity: {
        version: "0.8.17",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        hardhat: {
            chainId: 1337
        },
        mainnet: {
            url: process.env.MAINNET_URL,
            accounts: [process.env.PRIVATE_KEY]
        },
        goerli: {
            url: process.env.GOERLI_URL,
            accounts: [process.env.PRIVATE_KEY]
        }
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY
    }
};
```

## 7. Segurança

### 7.1 Auditoria

- [ ] Reentrancy
- [ ] Overflow/Underflow
- [ ] Access Control
- [ ] Signature Verification
- [ ] Gas Optimization
- [ ] Event Emission
- [ ] Error Handling
- [ ] Input Validation

### 7.2 Boas Práticas

- Uso de OpenZeppelin
- Verificação de assinaturas
- Proteção contra reentrância
- Eventos para rastreamento
- Validação de entrada
- Otimização de gas

## 8. Monitoramento

### 8.1 Eventos

```solidity
event ProofVerified(bytes32 indexed proofHash, uint256 balance);
event ProofRejected(bytes32 indexed proofHash, string reason);
event ProofSubmitted(bytes32 indexed proofHash, address indexed submitter, uint256 balance);
event ProofStatusUpdated(bytes32 indexed proofHash, bool verified);
```

### 8.2 Métricas

- Número de provas verificadas
- Número de provas rejeitadas
- Tempo médio de verificação
- Gas utilizado por operação

## 9. Referências

- [Solidity Documentation](https://docs.soliditylang.org)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Hardhat Documentation](https://hardhat.org/getting-started)
- [Ethereum Development](https://ethereum.org/developers) 