import dotenv from 'dotenv';
import { CorsOptions } from 'cors';

// Carregar variáveis de ambiente
dotenv.config();

// Interface de configuração
interface IConfig {
  env: string;
  server: {
    port: number;
    apiPrefix: string;
    apiVersion: string;
    timeout: number;
    rateLimit: {
      windowMs: number;
      max: number;
    };
  };
  database: {
    url: string;
    poolSize: number;
  };
  redis: {
    url: string;
    password: string | undefined;
    db: number;
  };
  jwt: {
    secret: string;
    expiration: string;
    refreshExpiration: string;
  };
  services: {
    blockchain: {
      port: number;
      host: string;
      rpcUrl: string;
      chainId: number;
      network: string;
    };
    user: {
      port: number;
      host: string;
    };
    zkp: {
      port: number;
      host: string;
      provingKeyPath: string;
      verificationKeyPath: string;
    };
  };
  cors: CorsOptions;
  logging: {
    level: string;
    format: string;
    filePath: string;
    maxSize: string;
    maxFiles: number;
  };
  metrics: {
    port: number;
    path: string;
    prefix: string;
  };
  cache: {
    ttl: number;
    prefix: string;
  };
  security: {
    encryptionKey: string;
    hashSalt: string;
  };
  ai: {
    ollamaApiUrl: string;
    modelName: string;
  };
}

// Configuração do sistema
export const config: IConfig = {
  env: process.env.NODE_ENV || 'development',
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    apiPrefix: process.env.API_PREFIX || '/api',
    apiVersion: process.env.API_VERSION || 'v1',
    timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
    rateLimit: {
      windowMs: parseInt(process.env.API_RATE_WINDOW || '900000', 10),
      max: parseInt(process.env.API_RATE_LIMIT || '100', 10)
    }
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ibelieve_dev',
    poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '10', 10)
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10)
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_key_change_in_production',
    expiration: process.env.JWT_EXPIRATION || '24h',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d'
  },
  services: {
    blockchain: {
      port: parseInt(process.env.BLOCKCHAIN_SERVICE_PORT || '8084', 10),
      host: process.env.BLOCKCHAIN_SERVICE_HOST || 'localhost',
      rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
      chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID || '1337', 10),
      network: process.env.BLOCKCHAIN_NETWORK || 'development'
    },
    user: {
      port: parseInt(process.env.USER_SERVICE_PORT || '8085', 10),
      host: process.env.USER_SERVICE_HOST || 'localhost'
    },
    zkp: {
      port: parseInt(process.env.ZKP_SERVICE_PORT || '8082', 10),
      host: process.env.ZKP_SERVICE_HOST || 'localhost',
      provingKeyPath: process.env.ZKP_PROVING_KEY_PATH || './keys/proving.key',
      verificationKeyPath: process.env.ZKP_VERIFICATION_KEY_PATH || './keys/verification.key'
    }
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: process.env.CORS_METHODS?.split(',') || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: process.env.CORS_ALLOWED_HEADERS?.split(',') || ['Content-Type', 'Authorization'],
    exposedHeaders: process.env.CORS_EXPOSED_HEADERS?.split(',') || ['Content-Range', 'X-Total-Count'],
    credentials: process.env.CORS_CREDENTIALS === 'true'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    format: process.env.LOG_FORMAT || 'json',
    filePath: process.env.LOG_FILE_PATH || 'logs/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '7', 10)
  },
  metrics: {
    port: parseInt(process.env.METRICS_PORT || '9090', 10),
    path: process.env.METRICS_PATH || '/metrics',
    prefix: process.env.METRICS_PREFIX || 'ibelieve_'
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
    prefix: process.env.CACHE_PREFIX || 'ibelieve_'
  },
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY || 'dev_encryption_key_change_in_production',
    hashSalt: process.env.HASH_SALT || 'dev_salt_change_in_production'
  },
  ai: {
    ollamaApiUrl: process.env.OLLAMA_API_URL || 'http://localhost:11434',
    modelName: process.env.MODEL_NAME || 'gemma:2b'
  }
}; 