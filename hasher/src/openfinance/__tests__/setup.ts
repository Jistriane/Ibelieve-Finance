// Configuração do ambiente de teste
process.env.NODE_ENV = 'test';
process.env.REDIS_URL = 'redis://localhost:6379';

// Configuração do OpenFinance
process.env.OPENFINANCE_CLIENT_ID = 'test-client-id';
process.env.OPENFINANCE_CLIENT_SECRET = 'test-client-secret';
process.env.OPENFINANCE_REDIRECT_URI = 'http://localhost:3000/callback';
process.env.OPENFINANCE_AUTH_URL = 'https://auth.openfinance.test/authorize';
process.env.OPENFINANCE_TOKEN_URL = 'https://auth.openfinance.test/token';
process.env.OPENFINANCE_BASE_URL = 'https://api.openfinance.test';

// Configuração do Redis
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.REDIS_PASSWORD = '';
process.env.REDIS_DB = '0';

// Configuração do Logger
process.env.LOG_LEVEL = 'error';

// Configuração do Metrics
process.env.METRICS_ENABLED = 'false'; 