import { OpenFinanceService } from '../../openfinance/service';
import { openFinanceConfig } from '../../config/openfinance';

// Mock do Redis
jest.mock('ioredis', () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      get: jest.fn(),
      setex: jest.fn()
    }))
  };
});

beforeAll(() => {
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.OPENFINANCE_CLIENT_ID = 'test_client_id';
  process.env.OPENFINANCE_CLIENT_SECRET = 'test_client_secret';
});

describe('OpenFinanceService', () => {
  let service: OpenFinanceService;
  let mockRedis: any;

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    
    // Configura o mock do Redis
    mockRedis = {
      get: jest.fn(),
      setex: jest.fn(),
    };

    // Cria uma nova instância do serviço para cada teste
    service = new OpenFinanceService();
  });

  describe('getAccessToken', () => {
    it('deve retornar token do cache quando disponível', async () => {
      const cachedToken = 'cached-token';
      mockRedis.get.mockResolvedValue(cachedToken);

      const token = await service['getAccessToken']();
      expect(token).toBe(cachedToken);
      expect(mockRedis.get).toHaveBeenCalledWith(openFinanceConfig.cache.tokenKey);
    });

    it('deve obter novo token quando não há cache', async () => {
      mockRedis.get.mockResolvedValue(null);
      
      // Mock da resposta do fetch
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          access_token: 'new-token',
          expires_in: 3600,
          token_type: 'Bearer'
        })
      });

      const token = await service['getAccessToken']();
      expect(token).toBe('new-token');
      expect(mockRedis.setex).toHaveBeenCalledWith(
        openFinanceConfig.cache.tokenKey,
        openFinanceConfig.cache.tokenExpiration,
        'new-token'
      );
    });

    it('deve lançar erro quando a resposta não é ok', async () => {
      mockRedis.get.mockResolvedValue(null);
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'Unauthorized'
      });

      await expect(service['getAccessToken']()).rejects.toThrow('Falha ao obter token de acesso');
    });
  });

  describe('getFinancialData', () => {
    it('deve retornar dados do cache quando disponível', async () => {
      const cachedData = { data: 'test' };
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await service.getFinancialData('token', '/endpoint');
      expect(result).toEqual(cachedData);
    });

    it('deve fazer requisição quando não há cache', async () => {
      mockRedis.get.mockResolvedValue(null);
      
      const mockResponse = { data: 'test' };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await service.getFinancialData('token', '/endpoint');
      expect(result).toEqual(mockResponse);
      expect(mockRedis.setex).toHaveBeenCalled();
    });
  });
});
