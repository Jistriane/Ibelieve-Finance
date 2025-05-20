"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenFinanceService = void 0;
const openfinance_1 = require("../config/openfinance");
const ioredis_1 = require("ioredis");
const logger_1 = require("../utils/logger");
const metrics_1 = require("../utils/metrics");
class OpenFinanceService {
    constructor() {
        if (!process.env.REDIS_URL) {
            throw new Error('REDIS_URL não está definida nas variáveis de ambiente');
        }
        this.redis = new ioredis_1.Redis(process.env.REDIS_URL);
        this.config = openfinance_1.openFinanceConfig;
        // Validação das configurações necessárias
        if (!this.config.clientId)
            throw new Error('clientId não está definido na configuração do OpenFinance');
        if (!this.config.clientSecret)
            throw new Error('clientSecret não está definido na configuração do OpenFinance');
        if (!this.config.redirectUri)
            throw new Error('redirectUri não está definido na configuração do OpenFinance');
        if (!this.config.authUrl)
            throw new Error('authUrl não está definido na configuração do OpenFinance');
        if (!this.config.tokenUrl)
            throw new Error('tokenUrl não está definido na configuração do OpenFinance');
        if (!this.config.baseUrl)
            throw new Error('baseUrl não está definido na configuração do OpenFinance');
    }
    async getAccessToken() {
        try {
            const cachedToken = await this.redis.get(this.config.cache.tokenKey);
            if (cachedToken) {
                return cachedToken;
            }
            const response = await fetch(this.config.tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: this.config.clientId,
                    client_secret: this.config.clientSecret
                })
            });
            if (!response.ok) {
                throw new Error('Falha ao obter token de acesso');
            }
            const data = await response.json();
            await this.redis.setex(this.config.cache.tokenKey, this.config.cache.tokenExpiration, data.access_token);
            return data.access_token;
        }
        catch (error) {
            logger_1.logger.error('Erro ao obter token de acesso', { error });
            throw error;
        }
    }
    async getAuthorizationUrl(scopes) {
        try {
            const state = this.generateState();
            const params = new URLSearchParams({
                client_id: this.config.clientId,
                redirect_uri: this.config.redirectUri,
                response_type: 'code',
                scope: scopes.join(' '),
                state
            });
            await this.redis.setex(`openfinance_state:${state}`, 300, JSON.stringify({ scopes }));
            return `${this.config.authUrl}?${params.toString()}`;
        }
        catch (error) {
            logger_1.logger.error('Erro ao gerar URL de autorização', { error, scopes });
            throw error;
        }
    }
    async handleCallback(code, state) {
        try {
            const stateData = await this.redis.get(`openfinance_state:${state}`);
            if (!stateData) {
                throw new Error('Estado inválido ou expirado');
            }
            const { scopes } = JSON.parse(stateData);
            const token = await this.exchangeCodeForToken(code);
            await this.redis.setex(`openfinance_token:${token.access_token}`, token.expires_in, JSON.stringify({ scopes }));
        }
        catch (error) {
            logger_1.logger.error('Erro ao processar callback', { error, code, state });
            throw error;
        }
    }
    async getFinancialData(accessToken, endpoint) {
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
            await this.redis.setex(cacheKey, this.config.cache.ttl, JSON.stringify(data));
            metrics_1.metrics.httpRequestDuration.observe({ method: 'GET', path: endpoint, status: response.status }, (Date.now() - startTime) / 1000);
            return data;
        }
        catch (error) {
            metrics_1.metrics.httpRequestErrors.inc({
                method: 'GET',
                path: endpoint,
                error_type: error instanceof Error ? error.message : 'unknown'
            });
            logger_1.logger.error('Erro ao obter dados do Open Finance', { error, endpoint });
            throw error;
        }
    }
    async exchangeCodeForToken(code) {
        try {
            const response = await fetch(this.config.tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: this.config.redirectUri,
                    client_id: this.config.clientId,
                    client_secret: this.config.clientSecret
                })
            });
            if (!response.ok) {
                throw new Error('Erro ao trocar código por token');
            }
            return response.json();
        }
        catch (error) {
            logger_1.logger.error('Erro ao trocar código por token', { error, code });
            throw error;
        }
    }
    generateState() {
        return Math.random().toString(36).substring(2, 15);
    }
    async makeRequest(endpoint, method = 'GET', body) {
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
            metrics_1.metrics.httpRequestsTotal.inc({
                method,
                path: endpoint,
                status: response.status
            });
            if (!response.ok) {
                metrics_1.metrics.httpRequestErrors.inc({
                    method,
                    path: endpoint,
                    error_type: response.status
                });
                throw new Error(`Erro na requisição: ${response.statusText}`);
            }
            const data = await response.json();
            metrics_1.metrics.httpRequestDuration.observe({ method, path: endpoint, status: response.status }, (Date.now() - startTime) / 1000);
            return data;
        }
        catch (error) {
            logger_1.logger.error('Erro ao fazer requisição', { error, endpoint, method });
            throw error;
        }
    }
}
exports.OpenFinanceService = OpenFinanceService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsdURBQStGO0FBQy9GLHFDQUFnQztBQUNoQyw0Q0FBeUM7QUFDekMsOENBQTJDO0FBUTNDLE1BQWEsa0JBQWtCO0lBSTdCO1FBQ0UsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDM0IsTUFBTSxJQUFJLEtBQUssQ0FBQyx1REFBdUQsQ0FBQyxDQUFDO1FBQzNFLENBQUM7UUFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksZUFBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLE1BQU0sR0FBRywrQkFBaUIsQ0FBQztRQUVoQywwQ0FBMEM7UUFDMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUTtZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMkRBQTJELENBQUMsQ0FBQztRQUN4RyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQywrREFBK0QsQ0FBQyxDQUFDO1FBQ2hILElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVc7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDhEQUE4RCxDQUFDLENBQUM7UUFDOUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMERBQTBELENBQUMsQ0FBQztRQUN0RyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQywyREFBMkQsQ0FBQyxDQUFDO1FBQ3hHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU87WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDBEQUEwRCxDQUFDLENB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TyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLGVBQU0sQ0FBQyxLQUFLLENBQUMsMEJBQTBCLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDdEUsTUFBTSxLQUFLLENBQUM7UUFDZCxDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBek5ELGdEQXlOQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IG9wZW5GaW5hbmNlQ29uZmlnLCBPcGVuRmluYW5jZVNjb3BlLCBPcGVuRmluYW5jZUNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy9vcGVuZmluYW5jZSc7XG5pbXBvcnQgeyBSZWRpcyB9IGZyb20gJ2lvcmVkaXMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcbmltcG9ydCB7IG1ldHJpY3MgfSBmcm9tICcuLi91dGlscy9tZXRyaWNzJztcblxuaW50ZXJmYWNlIFRva2VuUmVzcG9uc2Uge1xuICBhY2Nlc3NfdG9rZW46IHN0cmluZztcbiAgZXhwaXJlc19pbjogbnVtYmVyO1xuICB0b2tlbl90eXBlOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBPcGVuRmluYW5jZVNlcnZpY2Uge1xuICBwcml2YXRlIHJlZGlzOiBSZWRpcztcbiAgcHJpdmF0ZSBjb25maWc6IE9wZW5GaW5hbmNlQ29uZmlnO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGlmICghcHJvY2Vzcy5lbnYuUkVESVNfVVJMKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JFRElTX1VSTCBuw6NvIGVzdMOhIGRlZmluaWRhIG5hcyB2YXJpw6F2ZWlzIGRlIGFtYmllbnRlJyk7XG4gICAgfVxuICAgIHRoaXMucmVkaXMgPSBuZXcgUmVkaXMocHJvY2Vzcy5lbnYuUkVESVNfVVJMKTtcbiAgICB0aGlzLmNvbmZpZyA9IG9wZW5GaW5hbmNlQ29uZmlnO1xuXG4gICAgLy8gVmFsaWRhw6fDo28gZGFzIGNvbmZpZ3VyYcOnw7VlcyBuZWNlc3PDoXJpYXNcbiAgICBpZiAoIXRoaXMuY29uZmlnLmNsaWVudElkKSB0aHJvdyBuZXcgRXJyb3IoJ2NsaWVudElkIG7Do28gZXN0w6EgZGVmaW5pZG8gbmEgY29uZmlndXJhw6fDo28gZG8gT3BlbkZpbmFuY2UnKTtcbiAgICBpZiAoIXRoaXMuY29uZmlnLmNsaWVudFNlY3JldCkgdGhyb3cgbmV3IEVycm9yKCdjbGllbnRTZWNyZXQgbsOjbyBlc3TDoSBkZWZpbmlkbyBuYSBjb25maWd1cmHDp8OjbyBkbyBPcGVuRmluYW5jZScpO1xuICAgIGlmICghdGhpcy5jb25maWcucmVkaXJlY3RVcmkpIHRocm93IG5ldyBFcnJvcigncmVkaXJlY3RVcmkgbsOjbyBlc3TDoSBkZWZpbmlkbyBuYSBjb25maWd1cmHDp8OjbyBkbyBPcGVuRmluYW5jZScpO1xuICAgIGlmICghdGhpcy5jb25maWcuYXV0aFVybCkgdGhyb3cgbmV3IEVycm9yKCdhdXRoVXJsIG7Do28gZXN0w6EgZGVmaW5pZG8gbmEgY29uZmlndXJhw6fDo28gZG8gT3BlbkZpbmFuY2UnKTtcbiAgICBpZiAoIXRoaXMuY29uZmlnLnRva2VuVXJsKSB0aHJvdyBuZXcgRXJyb3IoJ3Rva2VuVXJsIG7Do28gZXN0w6EgZGVmaW5pZG8gbmEgY29uZmlndXJhw6fDo28gZG8gT3BlbkZpbmFuY2UnKTtcbiAgICBpZiAoIXRoaXMuY29uZmlnLmJhc2VVcmwpIHRocm93IG5ldyBFcnJvcignYmFzZVVybCBuw6NvIGVzdMOhIGRlZmluaWRvIG5hIGNvbmZpZ3VyYcOnw6NvIGRvIE9wZW5GaW5hbmNlJyk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGdldEFjY2Vzc1Rva2VuKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNhY2hlZFRva2VuID0gYXdhaXQgdGhpcy5yZWRpcy5nZXQodGhpcy5jb25maWcuY2FjaGUudG9rZW5LZXkpO1xuICAgICAgaWYgKGNhY2hlZFRva2VuKSB7XG4gICAgICAgIHJldHVybiBjYWNoZWRUb2tlbjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh0aGlzLmNvbmZpZy50b2tlblVybCEsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbiAgICAgICAgfSxcbiAgICAgICAgYm9keTogbmV3IFVSTFNlYXJjaFBhcmFtcyh7XG4gICAgICAgICAgZ3JhbnRfdHlwZTogJ2NsaWVudF9jcmVkZW50aWFscycsXG4gICAgICAgICAgY2xpZW50X2lkOiB0aGlzLmNvbmZpZy5jbGllbnRJZCEsXG4gICAgICAgICAgY2xpZW50X3NlY3JldDogdGhpcy5jb25maWcuY2xpZW50U2VjcmV0IVxuICAgICAgICB9KVxuICAgICAgfSk7XG5cbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWxoYSBhbyBvYnRlciB0b2tlbiBkZSBhY2Vzc28nKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKSBhcyBUb2tlblJlc3BvbnNlO1xuICAgICAgYXdhaXQgdGhpcy5yZWRpcy5zZXRleChcbiAgICAgICAgdGhpcy5jb25maWcuY2FjaGUudG9rZW5LZXksXG4gICAgICAgIHRoaXMuY29uZmlnLmNhY2hlLnRva2VuRXhwaXJhdGlvbixcbiAgICAgICAgZGF0YS5hY2Nlc3NfdG9rZW5cbiAgICAgICk7XG5cbiAgICAgIHJldHVybiBkYXRhLmFjY2Vzc190b2tlbjtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvIGFvIG9idGVyIHRva2VuIGRlIGFjZXNzbycsIHsgZXJyb3IgfSk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXRBdXRob3JpemF0aW9uVXJsKHNjb3BlczogT3BlbkZpbmFuY2VTY29wZVtdKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmdlbmVyYXRlU3RhdGUoKTtcbiAgICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoe1xuICAgICAgICBjbGllbnRfaWQ6IHRoaXMuY29uZmlnLmNsaWVudElkISxcbiAgICAgICAgcmVkaXJlY3RfdXJpOiB0aGlzLmNvbmZpZy5yZWRpcmVjdFVyaSEsXG4gICAgICAgIHJlc3BvbnNlX3R5cGU6ICdjb2RlJyxcbiAgICAgICAgc2NvcGU6IHNjb3Blcy5qb2luKCcgJyksXG4gICAgICAgIHN0YXRlXG4gICAgICB9KTtcblxuICAgICAgYXdhaXQgdGhpcy5yZWRpcy5zZXRleChcbiAgICAgICAgYG9wZW5maW5hbmNlX3N0YXRlOiR7c3RhdGV9YCxcbiAgICAgICAgMzAwLFxuICAgICAgICBKU09OLnN0cmluZ2lmeSh7IHNjb3BlcyB9KVxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIGAke3RoaXMuY29uZmlnLmF1dGhVcmx9PyR7cGFyYW1zLnRvU3RyaW5nKCl9YDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvIGFvIGdlcmFyIFVSTCBkZSBhdXRvcml6YcOnw6NvJywgeyBlcnJvciwgc2NvcGVzIH0pO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgaGFuZGxlQ2FsbGJhY2soY29kZTogc3RyaW5nLCBzdGF0ZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHN0YXRlRGF0YSA9IGF3YWl0IHRoaXMucmVkaXMuZ2V0KGBvcGVuZmluYW5jZV9zdGF0ZToke3N0YXRlfWApO1xuICAgICAgaWYgKCFzdGF0ZURhdGEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFc3RhZG8gaW52w6FsaWRvIG91IGV4cGlyYWRvJyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHsgc2NvcGVzIH0gPSBKU09OLnBhcnNlKHN0YXRlRGF0YSk7XG4gICAgICBjb25zdCB0b2tlbiA9IGF3YWl0IHRoaXMuZXhjaGFuZ2VDb2RlRm9yVG9rZW4oY29kZSk7XG5cbiAgICAgIGF3YWl0IHRoaXMucmVkaXMuc2V0ZXgoXG4gICAgICAgIGBvcGVuZmluYW5jZV90b2tlbjoke3Rva2VuLmFjY2Vzc190b2tlbn1gLFxuICAgICAgICB0b2tlbi5leHBpcmVzX2luLFxuICAgICAgICBKU09OLnN0cmluZ2lmeSh7IHNjb3BlcyB9KVxuICAgICAgKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvIGFvIHByb2Nlc3NhciBjYWxsYmFjaycsIHsgZXJyb3IsIGNvZGUsIHN0YXRlIH0pO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0RmluYW5jaWFsRGF0YShhY2Nlc3NUb2tlbjogc3RyaW5nLCBlbmRwb2ludDogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBjYWNoZUtleSA9IGBvcGVuZmluYW5jZV9kYXRhOiR7ZW5kcG9pbnR9OiR7YWNjZXNzVG9rZW59YDtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNhY2hlZERhdGEgPSBhd2FpdCB0aGlzLnJlZGlzLmdldChjYWNoZUtleSk7XG4gICAgICBpZiAoY2FjaGVkRGF0YSkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShjYWNoZWREYXRhKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHt0aGlzLmNvbmZpZy5iYXNlVXJsfSR7ZW5kcG9pbnR9YCwge1xuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7YWNjZXNzVG9rZW59YCxcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRXJybyBhbyBvYnRlciBkYWRvczogJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgYXdhaXQgdGhpcy5yZWRpcy5zZXRleChcbiAgICAgICAgY2FjaGVLZXksXG4gICAgICAgIHRoaXMuY29uZmlnLmNhY2hlLnR0bCxcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoZGF0YSlcbiAgICAgICk7XG5cbiAgICAgIG1ldHJpY3MuaHR0cFJlcXVlc3REdXJhdGlvbi5vYnNlcnZlKFxuICAgICAgICB7IG1ldGhvZDogJ0dFVCcsIHBhdGg6IGVuZHBvaW50LCBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyB9LFxuICAgICAgICAoRGF0ZS5ub3coKSAtIHN0YXJ0VGltZSkgLyAxMDAwXG4gICAgICApO1xuXG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbWV0cmljcy5odHRwUmVxdWVzdEVycm9ycy5pbmMoe1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICBwYXRoOiBlbmRwb2ludCxcbiAgICAgICAgZXJyb3JfdHlwZTogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAndW5rbm93bidcbiAgICAgIH0pO1xuICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvIGFvIG9idGVyIGRhZG9zIGRvIE9wZW4gRmluYW5jZScsIHsgZXJyb3IsIGVuZHBvaW50IH0pO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBleGNoYW5nZUNvZGVGb3JUb2tlbihjb2RlOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHRoaXMuY29uZmlnLnRva2VuVXJsISwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xuICAgICAgICB9LFxuICAgICAgICBib2R5OiBuZXcgVVJMU2VhcmNoUGFyYW1zKHtcbiAgICAgICAgICBncmFudF90eXBlOiAnYXV0aG9yaXphdGlvbl9jb2RlJyxcbiAgICAgICAgICBjb2RlLFxuICAgICAgICAgIHJlZGlyZWN0X3VyaTogdGhpcy5jb25maWcucmVkaXJlY3RVcmkhLFxuICAgICAgICAgIGNsaWVudF9pZDogdGhpcy5jb25maWcuY2xpZW50SWQhLFxuICAgICAgICAgIGNsaWVudF9zZWNyZXQ6IHRoaXMuY29uZmlnLmNsaWVudFNlY3JldCFcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRXJybyBhbyB0cm9jYXIgY8OzZGlnbyBwb3IgdG9rZW4nKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvIGFvIHRyb2NhciBjw7NkaWdvIHBvciB0b2tlbicsIHsgZXJyb3IsIGNvZGUgfSk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdlbmVyYXRlU3RhdGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDE1KTtcbiAgfVxuXG4gIGFzeW5jIG1ha2VSZXF1ZXN0KGVuZHBvaW50OiBzdHJpbmcsIG1ldGhvZDogc3RyaW5nID0gJ0dFVCcsIGJvZHk/OiBhbnkpIHtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke3RoaXMuY29uZmlnLmJhc2VVcmx9JHtlbmRwb2ludH1gLCB7XG4gICAgICAgIG1ldGhvZCxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7YXdhaXQgdGhpcy5nZXRBY2Nlc3NUb2tlbigpfWBcbiAgICAgICAgfSxcbiAgICAgICAgYm9keTogYm9keSA/IEpTT04uc3RyaW5naWZ5KGJvZHkpIDogdW5kZWZpbmVkXG4gICAgICB9KTtcblxuICAgICAgbWV0cmljcy5odHRwUmVxdWVzdHNUb3RhbC5pbmMoe1xuICAgICAgICBtZXRob2QsXG4gICAgICAgIHBhdGg6IGVuZHBvaW50LFxuICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1c1xuICAgICAgfSk7XG5cbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgbWV0cmljcy5odHRwUmVxdWVzdEVycm9ycy5pbmMoe1xuICAgICAgICAgIG1ldGhvZCxcbiAgICAgICAgICBwYXRoOiBlbmRwb2ludCxcbiAgICAgICAgICBlcnJvcl90eXBlOiByZXNwb25zZS5zdGF0dXNcbiAgICAgICAgfSk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRXJybyBuYSByZXF1aXNpw6fDo286ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIG1ldHJpY3MuaHR0cFJlcXVlc3REdXJhdGlvbi5vYnNlcnZlKFxuICAgICAgICB7IG1ldGhvZCwgcGF0aDogZW5kcG9pbnQsIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzIH0sXG4gICAgICAgIChEYXRlLm5vdygpIC0gc3RhcnRUaW1lKSAvIDEwMDBcbiAgICAgICk7XG5cbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0Vycm8gYW8gZmF6ZXIgcmVxdWlzacOnw6NvJywgeyBlcnJvciwgZW5kcG9pbnQsIG1ldGhvZCB9KTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxufSAiXX0=