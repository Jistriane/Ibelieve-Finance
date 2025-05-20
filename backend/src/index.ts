import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { BlockchainService } from './services/blockchain';

// Carrega as variáveis de ambiente
const envFile = process.env.NODE_ENV === 'production' ? '.env-prod' : '.env-dev';
const envPath = path.resolve(__dirname, '..', envFile);
console.log('Carregando variáveis de ambiente de:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Erro ao carregar variáveis de ambiente:', result.error);
  process.exit(1);
}

// Validação das variáveis de ambiente críticas
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

const app = express();

// Configuração do CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Serviço
const blockchainService = new BlockchainService();

// Rotas
app.post('/api/register-proof', async (req, res) => {
  try {
    const { proof, requestedAmount, netWorth, isApproved, walletAddress } = req.body;
    const proofHash = await blockchainService.registerProof(
      proof,
      requestedAmount,
      netWorth,
      isApproved,
      walletAddress
    );
    res.json({ success: true, proofHash });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/verify-proof/:proofHash', async (req, res) => {
  try {
    const { proofHash } = req.params;
    const exists = await blockchainService.verifyProof(proofHash);
    res.json({ success: true, exists });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/proof-details/:proofHash', async (req, res) => {
  try {
    const { proofHash } = req.params;
    const details = await blockchainService.getProofDetails(proofHash);
    res.json({ success: true, details });
  } catch (error: any) {
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