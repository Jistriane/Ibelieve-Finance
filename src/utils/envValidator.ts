import { z } from 'zod';
import * as dotenv from 'dotenv';
import path from 'path';

// Carregar variáveis de ambiente do arquivo .env-dev
const result = dotenv.config({ path: '.env-dev' });

if (result.error) {
  console.error('❌ Erro ao carregar arquivo .env-dev:', result.error);
  process.exit(1);
}

const envSchema = z.object({
  // Ambiente
  NODE_ENV: z.enum(['development', 'production', 'test']),

  // API
  REACT_APP_API_URL: z.string().url(),

  // Blockchain
  REACT_APP_NETWORK_NAME: z.enum(['sepolia', 'mainnet']),
  REACT_APP_ZKPROOF_CONTRACT_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  REACT_APP_ACME_TOKEN_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  REACT_APP_SUBWALLET_REGISTRY_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  SEPOLIA_URL: z.string().url(),
  PRIVATE_KEY: z.string(),
  INFURA_API_KEY: z.string().min(1),
  ETHERSCAN_API_KEY: z.string().min(1),
  METAMASK_API_KEY: z.string().min(1),
  REPORT_GAS: z.enum(['true', 'false']).transform((val) => val === 'true'),

  // Monitoramento
  PROMETHEUS_PORT: z.coerce.number(),
  GRAFANA_PORT: z.coerce.number(),
  GRAFANA_ADMIN_PASSWORD: z.string().min(1),

  // Banco de Dados
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_PORT: z.coerce.number(),
  POSTGRES_HOST: z.string().min(1),

  // Redis
  REDIS_PORT: z.coerce.number(),
  REDIS_HOST: z.string().min(1),

  // Ollama
  OLLAMA_API_URL: z.string().url(),
  MODEL_NAME: z.string().min(1),

  // ZK Proof
  ZK_PROOF_ENDPOINT: z.string().url(),
  ZK_PROOF_API_KEY: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']),
  LOG_FORMAT: z.enum(['json', 'text']),

  // Credenciais da Carteira
  WALLET_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),

  // Contratos Deployados
  CONTRACT_SUBWALLET_REGISTRY: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  CONTRACT_ACME_TOKEN: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  CONTRACT_ZKPROOF_REGISTRY: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Erro de validação nas variáveis de ambiente:');
      error.errors.forEach((err) => {
        console.error(`- ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

// Exporta as variáveis de ambiente tipadas
export const env = validateEnv();
