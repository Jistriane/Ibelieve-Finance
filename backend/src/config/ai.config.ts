import dotenv from 'dotenv';

dotenv.config();

export const AI_CONFIG = {
  // Configurações do modelo de IA
  MODEL: {
    NAME: process.env.AI_MODEL_NAME || 'gpt-4',
    TEMPERATURE: parseFloat(process.env.AI_MODEL_TEMPERATURE || '0.7'),
    MAX_TOKENS: parseInt(process.env.AI_MODEL_MAX_TOKENS || '2000', 10),
  },

  // Configurações de API
  API: {
    KEY: process.env.OPENAI_API_KEY,
    ENDPOINT: process.env.AI_API_ENDPOINT || 'https://api.openai.com/v1',
    TIMEOUT: parseInt(process.env.AI_API_TIMEOUT || '30000', 10),
  },

  // Configurações de cache
  CACHE: {
    ENABLED: process.env.AI_CACHE_ENABLED === 'true',
    TTL: parseInt(process.env.AI_CACHE_TTL || '300', 10), // 5 minutos em segundos
    MAX_SIZE: parseInt(process.env.AI_CACHE_MAX_SIZE || '1000', 10),
  },

  // Configurações de análise
  ANALYSIS: {
    // Limiares de risco
    RISK_THRESHOLDS: {
      LOW: 0.3,
      MEDIUM: 0.7,
      HIGH: 0.9,
    },

    // Pesos para diferentes fatores de risco
    RISK_WEIGHTS: {
      AMOUNT: 0.3,
      FREQUENCY: 0.2,
      TIME_OF_DAY: 0.1,
      LOCATION: 0.2,
      TRANSACTION_TYPE: 0.2,
    },

    // Configurações de detecção de fraude
    FRAUD_DETECTION: {
      MIN_CONFIDENCE: 0.8,
      SUSPICIOUS_AMOUNT_MULTIPLIER: 3,
      MAX_TRANSACTIONS_PER_HOUR: 10,
    },
  },

  // Configurações de logging
  LOGGING: {
    ENABLED: process.env.AI_LOGGING_ENABLED === 'true',
    LEVEL: process.env.AI_LOG_LEVEL || 'info',
    FILE_PATH: process.env.AI_LOG_FILE_PATH || './logs/ai.log',
  },

  // Configurações de rate limiting
  RATE_LIMIT: {
    ENABLED: process.env.AI_RATE_LIMIT_ENABLED === 'true',
    MAX_REQUESTS_PER_MINUTE: parseInt(process.env.AI_RATE_LIMIT_RPM || '60', 10),
    WINDOW_MS: parseInt(process.env.AI_RATE_LIMIT_WINDOW || '60000', 10),
  },
}; 