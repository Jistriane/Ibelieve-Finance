import { openFinanceConfig, OpenFinanceScope, OpenFinanceConfig } from '../config/openfinance';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export class OpenFinanceService {
  private redis: Redis;
  private config: OpenFinanceConfig;

  constructor() {
    if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL não está definida nas variáveis de ambiente');
    }
    this.redis = new Redis(process.env.REDIS_URL);
    this.config = openFinanceConfig;

    // Validação das configurações necessárias
    if (!this.config.clientId) throw new Error('clientId não está definido na configuração do OpenFinance');
    if (!this.config.clientSecret) throw new Error('clientSecret não está definido na configuração do OpenFinance');
    if (!this.config.redirectUri) throw new Error('redirectUri não está definido na configuração do OpenFinance');
    if (!this.config.authUrl) throw new Error('authUrl não está definido na configuração do OpenFinance');
    if (!this.config.tokenUrl) throw new Error('tokenUrl não está definido na configuração do OpenFinance');
    if (!this.config.baseUrl) throw new Error('baseUrl não está definido na configuração do OpenFinance');
  }

  private async getAccessToken(): Promise<string> {
    try {
      const cachedToken = await this.redis.get(this.config.cache.tokenKey);
      if (cachedToken) {
        return cachedToken;
      }

      const response = await fetch(this.config.tokenUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.clientId!,
          client_secret: this.config.clientSecret!
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao obter token de acesso');
      }

      const data = await response.json() as TokenResponse;
      await this.redis.setex(
        this.config.cache.tokenKey,
        this.config.cache.tokenExpiration,
        data.access_token
      );

      return data.access_token;
    } catch (error) {
      logger.error('Erro ao obter token de acesso', { error });
      throw error;
    }
  }

  async getAuthorizationUrl(scopes: OpenFinanceScope[]): Promise<string> {
    try {
      const state = this.generateState();
      const params = new URLSearchParams({
        client_id: this.config.clientId!,
        redirect_uri: this.config.redirectUri!,
        response_type: 'code',
        scope: scopes.join(' '),
        state
      });

      await this.redis.setex(
        `openfinance_state:${state}`,
        300,
        JSON.stringify({ scopes })
      );

      return `${this.config.authUrl}?${params.toString()}`;
    } catch (error) {
      logger.error('Erro ao gerar URL de autorização', { error, scopes });
      throw error;
    }
  }

  async handleCallback(code: string, state: string): Promise<void> {
    try {
      const stateData = await this.redis.get(`openfinance_state:${state}`);
      if (!stateData) {
        throw new Error('Estado inválido ou expirado');
      }

      const { scopes } = JSON.parse(stateData);
      const token = await this.exchangeCodeForToken(code);

      await this.redis.setex(
        `openfinance_token:${token.access_token}`,
        token.expires_in,
        JSON.stringify({ scopes })
      );
    } catch (error) {
      logger.error('Erro ao processar callback', { error, code, state });
      throw error;
    }
  }

  async getFinancialData(accessToken: string, endpoint: string): Promise<any> {
    const cacheKey = `openfinance_data:${endpoint}:${accessToken}`;
    const startTime = Date.now();

    try {
      const cachedData = await this.redis.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao obter dados: ${response.statusText}`);
      }

      const data = await response.json();
      await this.redis.setex(
        cacheKey,
        this.config.cache.ttl,
        JSON.stringify(data)
      );

      metrics.httpRequestDuration.observe(
        { method: 'GET', path: endpoint, status: response.status },
        (Date.now() - startTime) / 1000
      );

      return data;
    } catch (error) {
      metrics.httpRequestErrors.inc({
        method: 'GET',
        path: endpoint,
        error_type: error instanceof Error ? error.message : 'unknown'
      });
      logger.error('Erro ao obter dados do Open Finance', { error, endpoint });
      throw error;
    }
  }

  private async exchangeCodeForToken(code: string): Promise<any> {
    try {
      const response = await fetch(this.config.tokenUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.config.redirectUri!,
          client_id: this.config.clientId!,
          client_secret: this.config.clientSecret!
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao trocar código por token');
      }

      return response.json();
    } catch (error) {
      logger.error('Erro ao trocar código por token', { error, code });
      throw error;
    }
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  async makeRequest(endpoint: string, method: string = 'GET', body?: any) {
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAccessToken()}`
        },
        body: body ? JSON.stringify(body) : undefined
      });

      metrics.httpRequestsTotal.inc({
        method,
        path: endpoint,
        status: response.status
      });

      if (!response.ok) {
        metrics.httpRequestErrors.inc({
          method,
          path: endpoint,
          error_type: response.status
        });
        throw new Error(`Erro na requisição: ${response.statusText}`);
      }

      const data = await response.json();
      metrics.httpRequestDuration.observe(
        { method, path: endpoint, status: response.status },
        (Date.now() - startTime) / 1000
      );

      return data;
    } catch (error) {
      logger.error('Erro ao fazer requisição', { error, endpoint, method });
      throw error;
    }
  }
} 