"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const blockchain_1 = require("./services/blockchain");
const envFile = process.env.NODE_ENV === 'production' ? '.env-prod' : '.env-dev';
const envPath = path_1.default.resolve(__dirname, '..', envFile);
console.log('Carregando variáveis de ambiente de:', envPath);
const result = dotenv_1.default.config({ path: envPath });
if (result.error) {
    console.error('Erro ao carregar variáveis de ambiente:', result.error);
    process.exit(1);
}
const requiredEnvVars = [
    'ETHEREUM_RPC_URL',
    'PRIVATE_KEY',
    'PROOF_REGISTRY_ADDRESS',
    'PORT',
    'CORS_ORIGIN'
];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
    console.error('Variáveis de ambiente obrigatórias não definidas:', missingEnvVars);
    process.exit(1);
}
const app = (0, express_1.default)();
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
const blockchainService = new blockchain_1.BlockchainService();
app.post('/api/register-proof', async (req, res) => {
    try {
        const { proof, requestedAmount, netWorth, isApproved, walletAddress } = req.body;
        const proofHash = await blockchainService.registerProof(proof, requestedAmount, netWorth, isApproved, walletAddress);
        res.json({ success: true, proofHash });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.get('/api/verify-proof/:proofHash', async (req, res) => {
    try {
        const { proofHash } = req.params;
        const exists = await blockchainService.verifyProof(proofHash);
        res.json({ success: true, exists });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.get('/api/proof-details/:proofHash', async (req, res) => {
    try {
        const { proofHash } = req.params;
        const details = await blockchainService.getProofDetails(proofHash);
        res.json({ success: true, details });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log('Configuração carregada:');
    console.log('- ETHEREUM_RPC_URL:', process.env.ETHEREUM_RPC_URL);
    console.log('- PROOF_REGISTRY_ADDRESS:', process.env.PROOF_REGISTRY_ADDRESS);
    console.log('- CORS_ORIGIN:', process.env.CORS_ORIGIN);
});
//# sourceMappingURL=index.js.map