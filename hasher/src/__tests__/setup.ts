import { config } from 'dotenv';
import type { JestConfigWithTsJest } from 'ts-jest';

// Carrega as variáveis de ambiente do arquivo .env.test
config({ path: '.env.test' });

// Configuração global para os testes
process.env.NODE_ENV = 'test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.OPENFINANCE_CLIENT_ID = 'test_client_id';
process.env.OPENFINANCE_CLIENT_SECRET = 'test_client_secret';
process.env.OPENFINANCE_REDIRECT_URI = 'http://localhost:3000/callback';
process.env.OPENFINANCE_AUTH_URL = 'http://localhost:3000/auth';
process.env.OPENFINANCE_TOKEN_URL = 'http://localhost:3000/token';
process.env.OPENFINANCE_USERINFO_URL = 'http://localhost:3000/userinfo';
process.env.OPENFINANCE_BASE_URL = 'http://localhost:3000/api';
process.env.OPENFINANCE_SCOPE = 'openid profile email accounts balance transactions';

// Mock global do fetch
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);

// Limpa todos os mocks após cada teste
beforeEach(() => {
  jest.clearAllMocks();
});
