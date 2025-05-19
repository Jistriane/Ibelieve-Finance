# Contratos Inteligentes - Ibelieve Finance

## 1. Visão Geral

Este documento descreve os contratos inteligentes do Ibelieve Finance, incluindo sua estrutura, funcionalidades e integrações.

## 2. Estrutura dos Contratos

```
contracts/
├── interfaces/
│   ├── IERC20.sol
│   └── IProofVerifier.sol
├── core/
│   ├── IbelieveFinance.sol
│   ├── ProofManager.sol
│   └── TokenManager.sol
├── verifiers/
│   └── SolvencyVerifier.sol
└── libraries/
    └── ProofUtils.sol
```

## 3. Interfaces

### 3.1 IERC20

```solidity
// contracts/interfaces/IERC20.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
```

### 3.2 IProofVerifier

```solidity
// contracts/interfaces/IProofVerifier.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IProofVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[1] memory input
    ) external view returns (bool);
}
```

## 4. Contratos Principais

### 4.1 IbelieveFinance

```solidity
// contracts/core/IbelieveFinance.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./ProofManager.sol";
import "./TokenManager.sol";

contract IbelieveFinance is Ownable, Pausable {
    ProofManager public proofManager;
    TokenManager public tokenManager;

    event VerifierUpdated(address indexed oldVerifier, address indexed newVerifier);
    event ProofManagerUpdated(address indexed oldManager, address indexed newManager);
    event TokenManagerUpdated(address indexed oldManager, address indexed newManager);

    constructor(
        address _proofManager,
        address _tokenManager
    ) {
        proofManager = ProofManager(_proofManager);
        tokenManager = TokenManager(_tokenManager);
    }

    function updateVerifier(address _newVerifier) external onlyOwner {
        address oldVerifier = address(proofManager.verifier());
        proofManager.setVerifier(_newVerifier);
        emit VerifierUpdated(oldVerifier, _newVerifier);
    }

    function updateProofManager(address _newManager) external onlyOwner {
        address oldManager = address(proofManager);
        proofManager = ProofManager(_newManager);
        emit ProofManagerUpdated(oldManager, _newManager);
    }

    function updateTokenManager(address _newManager) external onlyOwner {
        address oldManager = address(tokenManager);
        tokenManager = TokenManager(_newManager);
        emit TokenManagerUpdated(oldManager, _newManager);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
```

### 4.2 ProofManager

```solidity
// contracts/core/ProofManager.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "../interfaces/IProofVerifier.sol";
import "../libraries/ProofUtils.sol";

contract ProofManager is Ownable, Pausable {
    IProofVerifier public verifier;
    mapping(bytes32 => bool) public usedProofs;

    event ProofSubmitted(bytes32 indexed proofHash, address indexed user, uint256 balance, uint256 timestamp);
    event ProofVerified(bytes32 indexed proofHash, bool success);
    event VerifierUpdated(address indexed oldVerifier, address indexed newVerifier);

    constructor(address _verifier) {
        verifier = IProofVerifier(_verifier);
    }

    function submitProof(
        bytes32 proofHash,
        uint256 balance,
        uint256 timestamp
    ) external whenNotPaused {
        require(!usedProofs[proofHash], "Proof already used");
        usedProofs[proofHash] = true;

        emit ProofSubmitted(proofHash, msg.sender, balance, timestamp);
    }

    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[1] memory input
    ) external whenNotPaused returns (bool) {
        bool success = verifier.verifyProof(a, b, c, input);
        bytes32 proofHash = ProofUtils.hashProof(a, b, c, input);

        emit ProofVerified(proofHash, success);
        return success;
    }

    function setVerifier(address _newVerifier) external onlyOwner {
        address oldVerifier = address(verifier);
        verifier = IProofVerifier(_newVerifier);
        emit VerifierUpdated(oldVerifier, _newVerifier);
    }
}
```

### 4.3 TokenManager

```solidity
// contracts/core/TokenManager.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract TokenManager is ERC20, Ownable, Pausable {
    mapping(address => bool) public verifiedUsers;
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1 milhão de tokens

    event UserVerified(address indexed user);
    event UserUnverified(address indexed user);

    constructor() ERC20("Ibelieve Token", "IBT") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function verifyUser(address user) external onlyOwner {
        verifiedUsers[user] = true;
        emit UserVerified(user);
    }

    function unverifyUser(address user) external onlyOwner {
        verifiedUsers[user] = false;
        emit UserUnverified(user);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(verifiedUsers[to], "User not verified");
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        require(verifiedUsers[msg.sender], "User not verified");
        _burn(msg.sender, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
```

## 5. Verificadores

### 5.1 SolvencyVerifier

```solidity
// contracts/verifiers/SolvencyVerifier.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IProofVerifier.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SolvencyVerifier is IProofVerifier, Ownable {
    // Parâmetros do circuito
    uint256 constant SNARK_SCALAR_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    
    // Chaves de verificação
    uint256[2] public vk_alpha1;
    uint256[2][2] public vk_beta2;
    uint256[2] public vk_gamma2;
    uint256[2] public vk_delta2;
    uint256[2][] public vk_ic;

    constructor(
        uint256[2] memory _vk_alpha1,
        uint256[2][2] memory _vk_beta2,
        uint256[2] memory _vk_gamma2,
        uint256[2] memory _vk_delta2,
        uint256[2][] memory _vk_ic
    ) {
        vk_alpha1 = _vk_alpha1;
        vk_beta2 = _vk_beta2;
        vk_gamma2 = _vk_gamma2;
        vk_delta2 = _vk_delta2;
        vk_ic = _vk_ic;
    }

    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[1] memory input
    ) public view override returns (bool) {
        // Implementação da verificação do proof
        // Esta é uma implementação simplificada
        // A implementação real deve incluir todas as verificações necessárias
        return true;
    }
}
```

## 6. Bibliotecas

### 6.1 ProofUtils

```solidity
// contracts/libraries/ProofUtils.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library ProofUtils {
    function hashProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[1] memory input
    ) internal pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                a[0], a[1],
                b[0][0], b[0][1],
                b[1][0], b[1][1],
                c[0], c[1],
                input[0]
            )
        );
    }

    function verifyTimestamp(uint256 timestamp) internal view returns (bool) {
        return timestamp <= block.timestamp;
    }

    function verifyBalance(uint256 balance) internal pure returns (bool) {
        return balance > 0;
    }
}
```

## 7. Testes

### 7.1 Teste do ProofManager

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

### 7.2 Teste do TokenManager

```solidity
// test/TokenManager.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenManager", function () {
    let tokenManager;
    let owner;
    let user;

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();

        const TokenManager = await ethers.getContractFactory("TokenManager");
        tokenManager = await TokenManager.deploy();
        await tokenManager.deployed();
    });

    it("deve verificar um usuário", async function () {
        await tokenManager.verifyUser(user.address);
        expect(await tokenManager.verifiedUsers(user.address)).to.be.true;
    });

    it("deve permitir mint para usuário verificado", async function () {
        await tokenManager.verifyUser(user.address);
        const amount = ethers.utils.parseEther("100");

        await tokenManager.mint(user.address, amount);
        expect(await tokenManager.balanceOf(user.address)).to.equal(amount);
    });

    it("não deve permitir mint para usuário não verificado", async function () {
        const amount = ethers.utils.parseEther("100");

        await expect(
            tokenManager.mint(user.address, amount)
        ).to.be.revertedWith("User not verified");
    });
});
```

## 8. Scripts de Deploy

```javascript
// scripts/deploy.js
const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployando contratos com a conta:", deployer.address);

    // Deploy do Verifier
    const Verifier = await hre.ethers.getContractFactory("SolvencyVerifier");
    const verifier = await Verifier.deploy(/* parâmetros do verifier */);
    await verifier.deployed();
    console.log("Verifier deployed to:", verifier.address);

    // Deploy do ProofManager
    const ProofManager = await hre.ethers.getContractFactory("ProofManager");
    const proofManager = await ProofManager.deploy(verifier.address);
    await proofManager.deployed();
    console.log("ProofManager deployed to:", proofManager.address);

    // Deploy do TokenManager
    const TokenManager = await hre.ethers.getContractFactory("TokenManager");
    const tokenManager = await TokenManager.deploy();
    await tokenManager.deployed();
    console.log("TokenManager deployed to:", tokenManager.address);

    // Deploy do IbelieveFinance
    const IbelieveFinance = await hre.ethers.getContractFactory("IbelieveFinance");
    const ibelieveFinance = await IbelieveFinance.deploy(
        proofManager.address,
        tokenManager.address
    );
    await ibelieveFinance.deployed();
    console.log("IbelieveFinance deployed to:", ibelieveFinance.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

## 9. Referências

- [Solidity Documentation](https://docs.soliditylang.org)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Hardhat Documentation](https://hardhat.org/getting-started)
- [Ethereum Development Documentation](https://ethereum.org/developers) 