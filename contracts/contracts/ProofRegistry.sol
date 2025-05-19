// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ProofRegistry {
    struct Proof {
        uint256 timestamp;
        uint256 requestedAmount;
        uint256 netWorth;
        bool isApproved;
        address walletAddress;
    }

    mapping(bytes32 => Proof) private proofs;
    mapping(address => bytes32[]) private userProofs;

    event ProofRegistered(
        bytes32 indexed proofHash,
        uint256 timestamp,
        uint256 requestedAmount,
        uint256 netWorth,
        bool isApproved,
        address indexed walletAddress
    );

    function registerProof(
        bytes32 proofHash,
        uint256 requestedAmount,
        uint256 netWorth,
        bool isApproved,
        address walletAddress
    ) external {
        require(proofHash != bytes32(0), "Invalid proof hash");
        require(walletAddress != address(0), "Invalid wallet address");
        require(proofs[proofHash].timestamp == 0, "Proof already registered");

        Proof memory newProof = Proof({
            timestamp: block.timestamp,
            requestedAmount: requestedAmount,
            netWorth: netWorth,
            isApproved: isApproved,
            walletAddress: walletAddress
        });

        proofs[proofHash] = newProof;
        userProofs[walletAddress].push(proofHash);

        emit ProofRegistered(
            proofHash,
            block.timestamp,
            requestedAmount,
            netWorth,
            isApproved,
            walletAddress
        );
    }

    function verifyProof(bytes32 proofHash) external view returns (bool) {
        return proofs[proofHash].timestamp != 0;
    }

    function getProofDetails(bytes32 proofHash)
        external
        view
        returns (
            uint256 timestamp,
            uint256 requestedAmount,
            uint256 netWorth,
            bool isApproved,
            address walletAddress
        )
    {
        Proof memory proof = proofs[proofHash];
        require(proof.timestamp != 0, "Proof not found");

        return (
            proof.timestamp,
            proof.requestedAmount,
            proof.netWorth,
            proof.isApproved,
            proof.walletAddress
        );
    }

    function getUserProofs(address walletAddress)
        external
        view
        returns (bytes32[] memory)
    {
        return userProofs[walletAddress];
    }
} 