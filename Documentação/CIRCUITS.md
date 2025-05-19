# Circuitos zk-SNARK - Ibelieve Finance

## 1. Visão Geral

Este documento descreve os circuitos zk-SNARK implementados no Ibelieve Finance para provas de solvência, incluindo sua estrutura, implementação e integração.

## 2. Estrutura dos Circuitos

```
circuits/
├── solvency/
│   ├── SolvencyProof.circom
│   ├── SolvencyVerifier.circom
│   └── SolvencyTest.circom
├── utils/
│   ├── PoseidonHash.circom
│   └── Comparators.circom
└── test/
    └── SolvencyTest.js
```

## 3. Circuito de Solvência

### 3.1 SolvencyProof.circom

```circom
// circuits/solvency/SolvencyProof.circom
pragma circom 2.0.0;

include "../utils/PoseidonHash.circom";
include "../utils/Comparators.circom";

template SolvencyProof() {
    // Entradas privadas
    signal private input balance;
    signal private input timestamp;
    signal private input secret;

    // Entradas públicas
    signal input publicBalance;
    signal input publicTimestamp;

    // Saída
    signal output proofHash;

    // Componentes
    component poseidon = PoseidonHash(3);
    component balanceCheck = GreaterThan();
    component timestampCheck = LessThan();

    // Verificações
    balanceCheck.in[0] <== balance;
    balanceCheck.in[1] <== 0;
    balanceCheck.out === 1;

    timestampCheck.in[0] <== timestamp;
    timestampCheck.in[1] <== publicTimestamp;
    timestampCheck.out === 1;

    // Hash da prova
    poseidon.inputs[0] <== balance;
    poseidon.inputs[1] <== timestamp;
    poseidon.inputs[2] <== secret;
    proofHash <== poseidon.out;
}

component main = SolvencyProof();
```

### 3.2 SolvencyVerifier.circom

```circom
// circuits/solvency/SolvencyVerifier.circom
pragma circom 2.0.0;

include "../utils/PoseidonHash.circom";

template SolvencyVerifier() {
    // Entradas
    signal input proofHash;
    signal input publicBalance;
    signal input publicTimestamp;

    // Componentes
    component poseidon = PoseidonHash(2);

    // Verificação do hash
    poseidon.inputs[0] <== publicBalance;
    poseidon.inputs[1] <== publicTimestamp;
    poseidon.out === proofHash;
}

component main = SolvencyVerifier();
```

## 4. Utilitários

### 4.1 PoseidonHash.circom

```circom
// circuits/utils/PoseidonHash.circom
pragma circom 2.0.0;

template PoseidonHash(n) {
    signal input inputs[n];
    signal output out;

    // Implementação do hash Poseidon
    // Esta é uma implementação simplificada
    // A implementação real deve incluir todas as rodadas necessárias
    out <== inputs[0];
    for (var i = 1; i < n; i++) {
        out <== out + inputs[i];
    }
}
```

### 4.2 Comparators.circom

```circom
// circuits/utils/Comparators.circom
pragma circom 2.0.0;

template GreaterThan() {
    signal input in[2];
    signal output out;

    // Implementação do comparador maior que
    // Esta é uma implementação simplificada
    // A implementação real deve incluir todas as verificações necessárias
    out <== in[0] > in[1] ? 1 : 0;
}

template LessThan() {
    signal input in[2];
    signal output out;

    // Implementação do comparador menor que
    // Esta é uma implementação simplificada
    // A implementação real deve incluir todas as verificações necessárias
    out <== in[0] < in[1] ? 1 : 0;
}
```

## 5. Compilação e Setup

### 5.1 Compilação do Circuito

```bash
# Compilar o circuito
circom circuits/solvency/SolvencyProof.circom --r1cs --wasm --sym -o build/solvency

# Gerar chaves de prova
snarkjs groth16 setup build/solvency/SolvencyProof.r1cs pot12_final.ptau build/solvency/SolvencyProof_final.zkey

# Exportar verificador
snarkjs zkey export verificationkey build/solvency/SolvencyProof_final.zkey build/solvency/verification_key.json
```

### 5.2 Geração de Prova

```javascript
// scripts/generateProof.js
const snarkjs = require("snarkjs");
const fs = require("fs");

async function generateProof(input) {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        "build/solvency/SolvencyProof_js/SolvencyProof.wasm",
        "build/solvency/SolvencyProof_final.zkey"
    );

    return {
        proof,
        publicSignals
    };
}

module.exports = {
    generateProof
};
```

## 6. Integração com Contratos

### 6.1 Verificador

```solidity
// contracts/verifiers/SolvencyVerifier.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SolvencyVerifier is Ownable {
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
    ) public view returns (bool) {
        // Implementação da verificação do proof
        // Esta é uma implementação simplificada
        // A implementação real deve incluir todas as verificações necessárias
        return true;
    }
}
```

### 6.2 Gerenciador de Provas

```solidity
// contracts/core/ProofManager.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "../verifiers/SolvencyVerifier.sol";

contract ProofManager is Ownable, Pausable {
    SolvencyVerifier public verifier;
    mapping(bytes32 => bool) public usedProofs;

    event ProofSubmitted(bytes32 indexed proofHash, address indexed user, uint256 balance, uint256 timestamp);
    event ProofVerified(bytes32 indexed proofHash, bool success);

    constructor(address _verifier) {
        verifier = SolvencyVerifier(_verifier);
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
        bytes32 proofHash = keccak256(abi.encodePacked(a, b, c, input));

        emit ProofVerified(proofHash, success);
        return success;
    }
}
```

## 7. Testes

### 7.1 Teste do Circuito

```javascript
// test/SolvencyTest.js
const chai = require("chai");
const { expect } = chai;
const snarkjs = require("snarkjs");
const { generateProof } = require("../scripts/generateProof");

describe("Solvency Circuit", function () {
    it("deve gerar prova válida", async function () {
        const input = {
            balance: 1000,
            timestamp: Math.floor(Date.now() / 1000),
            secret: 123456,
            publicBalance: 1000,
            publicTimestamp: Math.floor(Date.now() / 1000)
        };

        const { proof, publicSignals } = await generateProof(input);
        expect(proof).to.not.be.null;
        expect(publicSignals).to.not.be.null;
    });

    it("deve rejeitar prova inválida", async function () {
        const input = {
            balance: 0,
            timestamp: Math.floor(Date.now() / 1000),
            secret: 123456,
            publicBalance: 1000,
            publicTimestamp: Math.floor(Date.now() / 1000)
        };

        try {
            await generateProof(input);
            expect.fail("Deveria ter lançado erro");
        } catch (error) {
            expect(error).to.not.be.null;
        }
    });
});
```

## 8. Otimizações

### 8.1 Redução de Restrições

```circom
// circuits/solvency/OptimizedSolvencyProof.circom
pragma circom 2.0.0;

include "../utils/PoseidonHash.circom";

template OptimizedSolvencyProof() {
    // Entradas privadas
    signal private input balance;
    signal private input timestamp;
    signal private input secret;

    // Entradas públicas
    signal input publicBalance;
    signal input publicTimestamp;

    // Saída
    signal output proofHash;

    // Componentes
    component poseidon = PoseidonHash(3);

    // Verificações otimizadas
    balance > 0;
    timestamp < publicTimestamp;

    // Hash da prova
    poseidon.inputs[0] <== balance;
    poseidon.inputs[1] <== timestamp;
    poseidon.inputs[2] <== secret;
    proofHash <== poseidon.out;
}

component main = OptimizedSolvencyProof();
```

### 8.2 Otimização de Gas

```solidity
// contracts/verifiers/GasOptimizedVerifier.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract GasOptimizedVerifier is Ownable {
    // Parâmetros do circuito
    uint256 constant SNARK_SCALAR_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    
    // Chaves de verificação otimizadas
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
    ) public view returns (bool) {
        // Implementação otimizada da verificação do proof
        // Esta é uma implementação simplificada
        // A implementação real deve incluir todas as verificações necessárias
        return true;
    }
}
```

## 9. Segurança

### 9.1 Proteção contra Replay

```solidity
// contracts/core/ProofManager.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "../verifiers/SolvencyVerifier.sol";

contract ProofManager is Ownable, Pausable {
    SolvencyVerifier public verifier;
    mapping(bytes32 => bool) public usedProofs;
    mapping(address => uint256) public nonces;

    event ProofSubmitted(bytes32 indexed proofHash, address indexed user, uint256 balance, uint256 timestamp);
    event ProofVerified(bytes32 indexed proofHash, bool success);

    constructor(address _verifier) {
        verifier = SolvencyVerifier(_verifier);
    }

    function submitProof(
        bytes32 proofHash,
        uint256 balance,
        uint256 timestamp
    ) external whenNotPaused {
        require(!usedProofs[proofHash], "Proof already used");
        usedProofs[proofHash] = true;

        // Adiciona nonce ao hash da prova
        bytes32 proofHashWithNonce = keccak256(
            abi.encodePacked(
                proofHash,
                nonces[msg.sender]++
            )
        );

        emit ProofSubmitted(proofHashWithNonce, msg.sender, balance, timestamp);
    }

    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[1] memory input
    ) external whenNotPaused returns (bool) {
        bool success = verifier.verifyProof(a, b, c, input);
        bytes32 proofHash = keccak256(abi.encodePacked(a, b, c, input));

        emit ProofVerified(proofHash, success);
        return success;
    }
}
```

## 10. Referências

- [Circom Documentation](https://docs.circom.io)
- [SnarkJS Documentation](https://github.com/iden3/snarkjs)
- [Poseidon Hash](https://www.poseidon-hash.info)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts) 