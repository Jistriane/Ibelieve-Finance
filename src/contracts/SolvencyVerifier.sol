// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IZKVerifier {
    function verify(
        string calldata verifierType,
        bytes calldata proof,
        bytes calldata publicInputs
    ) external view returns (bool);
}

contract SolvencyVerifier {
    IZKVerifier public zkVerifier;
    
    struct SolvencyProof {
        bytes proof;
        uint256 timestamp;
        uint256 assets;
        uint256 liabilities;
        bool verified;
    }
    
    mapping(address => SolvencyProof[]) public proofs;
    
    event ProofRegistered(address indexed entity, uint256 timestamp, bool verified);
    event ProofVerified(address indexed entity, uint256 timestamp, bool success);
    
    constructor(address _zkVerifierAddress) {
        zkVerifier = IZKVerifier(_zkVerifierAddress);
    }
    
    function registerProof(
        bytes calldata _proof,
        uint256 _assets,
        uint256 _liabilities
    ) external {
        bool isValid = zkVerifier.verify(
            "solvency",
            _proof,
            abi.encodePacked(_assets, _liabilities)
        );
        
        SolvencyProof memory newProof = SolvencyProof({
            proof: _proof,
            timestamp: block.timestamp,
            assets: _assets,
            liabilities: _liabilities,
            verified: isValid
        });
        
        proofs[msg.sender].push(newProof);
        
        emit ProofRegistered(msg.sender, block.timestamp, isValid);
    }
    
    function verifyLatestProof(address entity) external view returns (bool) {
        require(proofs[entity].length > 0, "No proofs registered");
        
        SolvencyProof memory latestProof = proofs[entity][proofs[entity].length - 1];
        return latestProof.verified;
    }
    
    function getProofCount(address entity) external view returns (uint256) {
        return proofs[entity].length;
    }
    
    function getProof(address entity, uint256 index) external view returns (
        bytes memory proof,
        uint256 timestamp,
        uint256 assets,
        uint256 liabilities,
        bool verified
    ) {
        require(index < proofs[entity].length, "Invalid proof index");
        
        SolvencyProof memory p = proofs[entity][index];
        return (p.proof, p.timestamp, p.assets, p.liabilities, p.verified);
    }
} 