// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProofRegistry {
    struct Proof {
        bytes32 proofHash;
        uint256 timestamp;
        uint256 requestedAmount;
        uint256 netWorth;
        bool isApproved;
        address walletAddress;
    }

    // Mapeamento de hash da prova para os detalhes da prova
    mapping(bytes32 => Proof) public proofs;
    
    // Evento emitido quando uma nova prova é registrada
    event ProofRegistered(
        bytes32 indexed proofHash,
        address indexed walletAddress,
        uint256 timestamp,
        uint256 requestedAmount,
        uint256 netWorth,
        bool isApproved
    );

    // Função para registrar uma nova prova
    function registerProof(
        bytes32 _proofHash,
        uint256 _requestedAmount,
        uint256 _netWorth,
        bool _isApproved,
        address _walletAddress
    ) external {
        require(proofs[_proofHash].timestamp == 0, "Proof already registered");
        
        Proof memory newProof = Proof({
            proofHash: _proofHash,
            timestamp: block.timestamp,
            requestedAmount: _requestedAmount,
            netWorth: _netWorth,
            isApproved: _isApproved,
            walletAddress: _walletAddress
        });
        
        proofs[_proofHash] = newProof;
        
        emit ProofRegistered(
            _proofHash,
            _walletAddress,
            block.timestamp,
            _requestedAmount,
            _netWorth,
            _isApproved
        );
    }

    // Função para verificar se uma prova existe
    function verifyProof(bytes32 _proofHash) external view returns (bool) {
        return proofs[_proofHash].timestamp != 0;
    }

    // Função para obter os detalhes de uma prova
    function getProofDetails(bytes32 _proofHash) external view returns (
        uint256 timestamp,
        uint256 requestedAmount,
        uint256 netWorth,
        bool isApproved,
        address walletAddress
    ) {
        Proof memory proof = proofs[_proofHash];
        require(proof.timestamp != 0, "Proof does not exist");
        
        return (
            proof.timestamp,
            proof.requestedAmount,
            proof.netWorth,
            proof.isApproved,
            proof.walletAddress
        );
    }
} 