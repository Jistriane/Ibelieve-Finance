// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ProofRegistry {
    struct Proof {
        bytes32 proofHash;
        uint256 requestedAmount;
        uint256 netWorth;
        bool isApproved;
        address walletAddress;
        uint256 timestamp;
    }

    mapping(bytes32 => bool) private registeredProofs;
    mapping(address => Proof[]) private userProofs;

    event ProofRegistered(
        bytes32 indexed proofHash,
        address indexed walletAddress,
        uint256 requestedAmount,
        uint256 netWorth,
        bool isApproved,
        uint256 timestamp
    );

    function registerProof(
        bytes32 proofHash,
        uint256 requestedAmount,
        uint256 netWorth,
        bool isApproved,
        address walletAddress
    ) external returns (bool) {
        require(!registeredProofs[proofHash], "Proof already registered");
        require(walletAddress != address(0), "Invalid wallet address");

        Proof memory newProof = Proof({
            proofHash: proofHash,
            requestedAmount: requestedAmount,
            netWorth: netWorth,
            isApproved: isApproved,
            walletAddress: walletAddress,
            timestamp: block.timestamp
        });

        registeredProofs[proofHash] = true;
        userProofs[walletAddress].push(newProof);

        emit ProofRegistered(
            proofHash,
            walletAddress,
            requestedAmount,
            netWorth,
            isApproved,
            block.timestamp
        );

        return true;
    }

    function getProof(bytes32 proofHash) external view returns (Proof memory) {
        require(registeredProofs[proofHash], "Proof not found");
        
        for (uint i = 0; i < userProofs[msg.sender].length; i++) {
            if (userProofs[msg.sender][i].proofHash == proofHash) {
                return userProofs[msg.sender][i];
            }
        }
        
        revert("Proof not found for this user");
    }

    function getUserProofs(address walletAddress) external view returns (Proof[] memory) {
        return userProofs[walletAddress];
    }

    function isProofRegistered(bytes32 proofHash) external view returns (bool) {
        return registeredProofs[proofHash];
    }
} 