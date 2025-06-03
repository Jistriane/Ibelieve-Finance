// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ACMEToken.sol";
import "./SubwalletRegistry.sol";

/**
 * @dev Registro de provas ZK com controle de acesso e capacidade de pausa
 */
contract ZKProofRegistry is Ownable, Pausable {
    // Interface do token ACME e registro de subwallets
    ACMEToken public acmeToken;
    SubwalletRegistry public subwalletRegistry;

    struct Proof {
        bytes32 hash;
        address submitter;
        uint256 timestamp;
        bool verified;
        uint256 tokenAmount; // Quantidade de tokens ACME envolvidos
        address subwallet;   // Subwallet que gerou a prova
    }

    // Custo em tokens ACME para registrar uma prova
    uint256 public PROOF_REGISTRATION_COST = 0.1 * 10**18; // 0.1 ACME token inicial

    // Desconto máximo para subwallets ativas (30%)
    uint256 public constant MAX_DISCOUNT = 30;

    mapping(bytes32 => Proof) private _proofs;
    mapping(address => bytes32[]) public userProofs;

    event ProofSubmitted(bytes32 indexed proofId, address indexed submitter);
    event ProofVerified(bytes32 indexed proofId, address indexed verifier);
    event RegistrationCostUpdated(uint256 oldCost, uint256 newCost);
    event EmergencyRecovery(address token, uint256 amount);

    /**
     * @dev Inicializa o registro com um proprietário inicial
     */
    constructor(
        address _acmeToken,
        address _subwalletRegistry,
        address initialOwner
    ) Ownable() Pausable() {
        require(_acmeToken != address(0), "Endereco do token invalido");
        require(_subwalletRegistry != address(0), "Endereco do registro invalido");
        acmeToken = ACMEToken(_acmeToken);
        subwalletRegistry = SubwalletRegistry(_subwalletRegistry);
        _transferOwnership(initialOwner);
    }

    modifier onlySubwallet() {
        require(subwalletRegistry.isValidSubwallet(msg.sender), "Apenas subwallets autorizadas");
        _;
    }

    // Calcula o custo com desconto baseado na atividade da subwallet
    function getDiscountedCost(address subwallet) public view returns (uint256) {
        uint256 proofCount = userProofs[subwallet].length;
        uint256 discount = (proofCount > 10) ? MAX_DISCOUNT : (proofCount * 3);
        uint256 discountAmount = (PROOF_REGISTRATION_COST * discount) / 100;
        return PROOF_REGISTRATION_COST - discountAmount;
    }

    /**
     * @dev Submete uma nova prova
     */
    function submitProof(bytes32 proofHash) public whenNotPaused {
        require(proofHash != bytes32(0), "Proof hash cannot be zero");
        require(_proofs[proofHash].hash == bytes32(0), "Proof already exists");
        require(subwalletRegistry.isValidSubwallet(msg.sender), "Apenas subwallets autorizadas");
        
        uint256 cost = getDiscountedCost(msg.sender);
        require(
            acmeToken.balanceOf(msg.sender) >= cost,
            "Saldo ACME insuficiente"
        );
        
        // Transferir tokens para este contrato e depois queimá-los
        require(
            acmeToken.transferFrom(msg.sender, address(this), cost),
            "Transferencia falhou"
        );
        acmeToken.burn(cost);
        
        _proofs[proofHash] = Proof({
            hash: proofHash,
            submitter: msg.sender,
            timestamp: block.timestamp,
            verified: false,
            tokenAmount: cost,
            subwallet: msg.sender
        });

        userProofs[msg.sender].push(proofHash);

        emit ProofSubmitted(proofHash, msg.sender);
    }

    /**
     * @dev Verifica uma prova existente
     */
    function verifyProof(bytes32 proofId) public onlyOwner whenNotPaused {
        require(_proofs[proofId].hash != bytes32(0), "Proof does not exist");
        require(!_proofs[proofId].verified, "Proof already verified");
        
        _proofs[proofId].verified = true;
        emit ProofVerified(proofId, msg.sender);
    }

    /**
     * @dev Retorna os detalhes de uma prova
     */
    function getProof(bytes32 proofId) public view returns (
        bytes32 hash,
        address submitter,
        uint256 timestamp,
        bool verified,
        uint256 tokenAmount,
        address subwallet
    ) {
        Proof memory proof = _proofs[proofId];
        require(proof.hash != bytes32(0), "Proof does not exist");
        
        return (
            proof.hash,
            proof.submitter,
            proof.timestamp,
            proof.verified,
            proof.tokenAmount,
            proof.subwallet
        );
    }

    function getUserProofs(address user) external view returns (bytes32[] memory) {
        return userProofs[user];
    }

    /**
     * @dev Permite que o proprietário pause o registro
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Permite que o proprietário despause o registro
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    function updateRegistrationCost(uint256 newCost) external onlyOwner {
        uint256 oldCost = PROOF_REGISTRATION_COST;
        PROOF_REGISTRATION_COST = newCost;
        emit RegistrationCostUpdated(oldCost, newCost);
    }

    // Função de emergência para recuperar tokens
    function emergencyTokenRecovery(address token, uint256 amount) external onlyOwner {
        require(token != address(acmeToken), "Nao pode recuperar token ACME");
        IERC20(token).transfer(owner(), amount);
        emit EmergencyRecovery(token, amount);
    }

    // Estrutura para estatísticas
    struct Statistics {
        uint256 totalProofs;
        uint256 verifiedProofs;
        uint256 totalTokensBurned;
        uint256 activeSubwallets;
    }

    function getStatistics() external view returns (Statistics memory) {
        uint256 totalProofs = 0;
        uint256 verifiedProofs = 0;
        uint256 totalTokensBurned = 0;
        uint256 activeSubwallets = 0;
        address[] memory allSubwallets = subwalletRegistry.getAllSubwallets();

        for (uint i = 0; i < allSubwallets.length; i++) {
            bytes32[] memory walletProofs = userProofs[allSubwallets[i]];
            if (walletProofs.length > 0) {
                activeSubwallets++;
                totalProofs += walletProofs.length;
                
                for (uint j = 0; j < walletProofs.length; j++) {
                    Proof memory proof = _proofs[walletProofs[j]];
                    if (proof.verified) verifiedProofs++;
                    totalTokensBurned += proof.tokenAmount;
                }
            }
        }

        return Statistics({
            totalProofs: totalProofs,
            verifiedProofs: verifiedProofs,
            totalTokensBurned: totalTokensBurned,
            activeSubwallets: activeSubwallets
        });
    }
} 