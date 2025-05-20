import { OpenFinanceService } from '../service';
import { metrics } from '../../utils/metrics';
import { logger } from '../../utils/logger';
import { openFinanceConfig, OpenFinanceScope } from '../../config/openfinance';

// Mock do Redis
const MockRedis = jest.fn().mockImplementation(() => ({
  get: jest.fn(),
  setex: jest.fn()
}));

jest.mock('ioredis', () => ({
  __esModule: true,
  Redis: MockRedis
}));

jest.mock('../../utils/metrics');
jest.mock('../../utils/logger');

describe('OpenFinanceService', () => {
  let service: OpenFinanceService;
  let mockRedis: {
    get: jest.Mock;
    setex: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRedis = {
      get: jest.fn(),
      setex: jest.fn()
    };

    MockRedis.mockImplementation(() => mockRedis);
    service = new OpenFinanceService();
  });

  describe('getAuthorizationUrl', () => {
    it('deve gerar URL de autorização corretamente', async () => {
      const scopes: OpenFinanceScope[] = ['accounts', 'balance'];
      const url = await service.getAuthorizationUrl(scopes);

      expect(url).toContain('response_type=code');
      expect(url).toContain('scope=accounts+balance');
      expect(mockRedis.setex).toHaveBeenCalled();
    });
  });

  describe('handleCallback', () => {
    it('deve processar callback com sucesso', async () => {
      const code = 'test_code';
      const state = 'test_state';
      const scopes: OpenFinanceScope[] = ['accounts'];

      mockRedis.get.mockResolvedValue(JSON.stringify({ scopes }));
      mockRedis.setex.mockResolvedValue('OK');

      await service.handleCallback(code, state);

      expect(mockRedis.get).toHaveBeenCalledWith(`openfinance_state:${state}`);
      expect(mockRedis.setex).toHaveBeenCalled();
    });

    it('deve lançar erro para estado inválido', async () => {
      mockRedis.get.mockResolvedValue(null);

      await expect(service.handleCallback('code', 'invalid_state'))
        .rejects
        .toThrow('Estado inválido ou expirado');
    });
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

    it('deve registrar erro quando a API falha', async () => {
      mockRedis.get.mockResolvedValue(null);

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'Bad Request'
      });

      await expect(service.getFinancialData('token', '/balances'))
        .rejects
        .toThrow('Erro ao obter dados: Bad Request');

      expect(metrics.httpRequestErrors.inc).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });
  });
}); 