"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainService = void 0;
const api_1 = require("@polkadot/api");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '.env-dev' });
class BlockchainService {
    constructor() {
        this.api = null;
        this.provider = null;
        try {
            console.log('Iniciando conexão com a testnet do zkVerify...');
            const wsUrl = process.env.WS_URL || 'wss://zkverify-testnet.subscan.io/ws';
            console.log('Conectando ao WebSocket:', wsUrl);
            this.provider = new api_1.WsProvider(wsUrl, 60000);
            this.provider.on('connected', () => {
                console.log('WebSocket conectado');
                this.initializeApi();
            });
            this.provider.on('disconnected', () => {
                console.log('WebSocket desconectado');
                setTimeout(() => {
                    var _a;
                    console.log('Tentando reconectar...');
                    (_a = this.provider) === null || _a === void 0 ? void 0 : _a.connect();
                }, 5000);
            });
            this.provider.on('error', (error) => {
                console.error('Erro no WebSocket:', error);
                setTimeout(() => {
                    var _a;
                    console.log('Tentando reconectar após erro...');
                    (_a = this.provider) === null || _a === void 0 ? void 0 : _a.connect();
                }, 5000);
            });
        }
        catch (error) {
            console.error('Erro ao inicializar BlockchainService:', error);
            throw error;
        }
    }
    async initializeApi() {
        try {
            if (!this.provider) {
                throw new Error('Provider não inicializado');
            }
            this.api = await api_1.ApiPromise.create({
                provider: this.provider,
                types: {
                    TokenSymbol: {
                        _enum: ['tVFY']
                    },
                    TokenData: {
                        symbol: 'TokenSymbol',
                        decimals: 'u8',
                        total_supply: 'Balance'
                    }
                },
                throwOnConnect: true,
                noInitWarn: true
            });
            await this.api.isReady;
            console.log('API inicializada');
            console.log('Rede conectada!');
        }
        catch (error) {
            console.error('Erro ao inicializar API:', error);
            setTimeout(() => {
                console.log('Tentando reinicializar API...');
                this.initializeApi();
            }, 5000);
        }
    }
    async ensureApiInitialized() {
        var _a, _b;
        if (!this.api) {
            await this.initializeApi();
        }
        if (!((_a = this.api) === null || _a === void 0 ? void 0 : _a.isReady)) {
            await ((_b = this.api) === null || _b === void 0 ? void 0 : _b.isReady);
        }
    }
    generateProofHash(proof) {
        if (!this.api) {
            throw new Error('API não inicializada');
        }
        const proofString = JSON.stringify(proof);
        return this.api.createType('Hash', proofString).toHex();
    }
    async registerProof(proof, requestedAmount, netWorth, isApproved, walletAddress) {
        try {
            await this.ensureApiInitialized();
            if (!this.api) {
                throw new Error('API não inicializada');
            }
            console.log('Iniciando registro de prova na blockchain...');
            console.log('Parâmetros:', {
                requestedAmount,
                netWorth,
                isApproved,
                walletAddress,
                proofSize: JSON.stringify(proof).length
            });
            if (requestedAmount === undefined || netWorth === undefined || isApproved === undefined || !walletAddress) {
                throw new Error('Parâmetros inválidos para registrar prova');
            }
            const proofHash = this.generateProofHash(proof);
            const requestedAmountBN = this.api.createType('Balance', requestedAmount.toString());
            const netWorthBN = this.api.createType('Balance', netWorth.toString());
            console.log('Dados preparados:', {
                proofHash,
                requestedAmountBN: requestedAmountBN.toString(),
                netWorthBN: netWorthBN.toString(),
                isApproved,
                walletAddress
            });
            console.log('Enviando transação...');
            const tx = await this.api.tx.proofRegistry.registerProof(proofHash, requestedAmountBN, netWorthBN, isApproved, walletAddress).signAndSend(walletAddress, (result) => {
                if (result.status.isInBlock) {
                    console.log('Transação incluída no bloco:', result.status.asInBlock.toHex());
                }
            });
            console.log('Transação enviada:', tx.toString());
            return proofHash;
        }
        catch (error) {
            console.error('Erro detalhado ao registrar prova:', error);
            throw new Error(`Falha ao registrar prova na blockchain: ${error.message}`);
        }
    }
    async verifyProof(proofHash) {
        try {
            await this.ensureApiInitialized();
            if (!this.api) {
                throw new Error('API não inicializada');
            }
            const result = await this.api.query.proofRegistry.verifyProof(proofHash);
            return result.isSome;
        }
        catch (error) {
            console.error('Erro ao verificar prova na blockchain:', error);
            throw new Error('Falha ao verificar prova na blockchain');
        }
    }
    async getProofDetails(proofHash) {
        try {
            await this.ensureApiInitialized();
            if (!this.api) {
                throw new Error('API não inicializada');
            }
            const details = await this.api.query.proofRegistry.getProofDetails(proofHash);
            if (!details.isSome) {
                throw new Error('Prova não encontrada');
            }
            const proofData = details.unwrap();
            return {
                timestamp: proofData.timestamp.toNumber(),
                requestedAmount: proofData.requestedAmount.toNumber(),
                netWorth: proofData.netWorth.toNumber(),
                isApproved: proofData.isApproved,
                walletAddress: proofData.walletAddress.toString()
            };
        }
        catch (error) {
            console.error('Erro ao obter detalhes da prova na blockchain:', error);
            throw new Error('Falha ao obter detalhes da prova na blockchain');
        }
    }
    async disconnect() {
        try {
            if (this.provider) {
                await this.provider.disconnect();
                this.provider = null;
            }
            this.api = null;
            console.log('Desconectado da rede');
        }
        catch (error) {
            console.error('Erro ao desconectar:', error);
        }
    }
}
exports.BlockchainService = BlockchainService;
//# sourceMappingURL=blockchain.js.map