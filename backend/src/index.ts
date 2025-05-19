import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import proofsRouter from './routes/proofs';

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
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rotas
app.use('/api/proofs', proofsRouter);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Configuração carregada:');
  console.log('- ETHEREUM_RPC_URL:', process.env.ETHEREUM_RPC_URL);
  console.log('- PROOF_REGISTRY_ADDRESS:', process.env.PROOF_REGISTRY_ADDRESS);
  console.log('- CORS_ORIGIN:', process.env.CORS_ORIGIN);
}); 