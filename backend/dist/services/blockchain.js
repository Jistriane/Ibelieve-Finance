"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainService = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const ProofRegistry_json_1 = __importDefault(require("../contracts/ProofRegistry.json"));
class BlockchainService {
    constructor() {
        this.provider = new ethers_1.ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
        this.wallet = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        this.contract = new ethers_1.ethers.Contract(process.env.PROOF_REGISTRY_ADDRESS, ProofRegistry_json_1.default.abi, this.wallet);
    }
    generateProofHash(proof) {
        const proofString = JSON.stringify(proof);
        return (0, utils_1.keccak256)(ethers_1.ethers.utils.toUtf8Bytes(proofString));
    }
    async registerProof(proof, requestedAmount, netWorth, isApproved, walletAddress) {
        try {
            const proofHash = this.generateProofHash(proof);
            const requestedAmountBN = ethers_1.ethers.BigNumber.from(requestedAmount.toString());
            const netWorthBN = ethers_1.ethers.BigNumber.from(netWorth.toString());
            const tx = await this.contract.registerProof(proofHash, requestedAmountBN, netWorthBN, isApproved, walletAddress);
            await tx.wait();
            return proofHash;
        }
        catch (error) {
            console.error('Erro ao registrar prova na blockchain:', error);
            throw new Error('Falha ao registrar prova na blockchain');
        }
    }
    async verifyProof(proofHash) {
        try {
            return await this.contract.verifyProof(proofHash);
        }
        catch (error) {
            console.error('Erro ao verificar prova na blockchain:', error);
            throw new Error('Falha ao verificar prova na blockchain');
        }
    }
    async getProofDetails(proofHash) {
        try {
            const details = await this.contract.getProofDetails(proofHash);
            return {
                timestamp: details.timestamp.toNumber(),
                requestedAmount: details.requestedAmount.toNumber(),
                netWorth: details.netWorth.toNumber(),
                isApproved: details.isApproved,
                walletAddress: details.walletAddress
            };
        }
        catch (error) {
            console.error('Erro ao obter detalhes da prova na blockchain:', error);
            throw new Error('Falha ao obter detalhes da prova na blockchain');
        }
    }
}
exports.BlockchainService = BlockchainService;
//# sourceMappingURL=blockchain.js.map