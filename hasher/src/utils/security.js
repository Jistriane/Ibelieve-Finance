"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compress = exports.generateToken = exports.validateToken = exports.sensitiveLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_redis_1 = __importDefault(require("rate-limit-redis"));
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("./logger");
const compression_1 = __importDefault(require("compression"));
// Configuração do cliente Redis
const redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});
redis.on('error', (err) => {
    logger_1.logger.error('Erro na conexão com Redis:', err);
});
// Configuração do rate limiter
exports.apiLimiter = (0, express_rate_limit_1.default)({
    store: new rate_limit_redis_1.default({
        client: redis,
        prefix: 'rate-limit:',
        windowMs: 15 * 60 * 1000, // 15 minutos
    }),
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite de 100 requisições por IP
    message: {
        error: 'Muitas requisições deste IP, por favor tente novamente após 15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Rate limiter mais restritivo para endpoints sensíveis
exports.sensitiveLimiter = (0, express_rate_limit_1.default)({
    store: new rate_limit_redis_1.default({
        client: redis,
        prefix: 'sensitive-limit:',
        windowMs: 60 * 60 * 1000, // 1 hora
    }),
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10, // limite de 10 requisições por IP
    message: {
        error: 'Muitas requisições deste IP, por favor tente novamente após 1 hora'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Função para validar token JWT
const validateToken = (token) => {
    try {
        // Implementar validação do token JWT
        return true;
    }
    catch (error) {
        logger_1.logger.error('Erro ao validar token:', error);
        return false;
    }
};
exports.validateToken = validateToken;
// Função para gerar token JWT
const generateToken = (payload) => {
    try {
        // Implementar geração do token JWT
        return 'token';
    }
    catch (error) {
        logger_1.logger.error('Erro ao gerar token:', error);
        throw error;
    }
};
exports.generateToken = generateToken;
// Middleware de compressão
exports.compress = (0, compression_1.default)();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdXJpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzZWN1cml0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSw0RUFBMkM7QUFDM0Msd0VBQTBDO0FBQzFDLHNEQUE0QjtBQUM1QixxQ0FBa0M7QUFDbEMsOERBQXNDO0FBR3RDLGdDQUFnQztBQUNoQyxNQUFNLEtBQUssR0FBRyxJQUFJLGlCQUFLLENBQUM7SUFDdEIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLFdBQVc7SUFDM0MsSUFBSSxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxNQUFNLENBQUM7SUFDaEQsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYztJQUNwQyxhQUFhLEVBQUUsQ0FBQyxLQUFhLEVBQUUsRUFBRTtRQUMvQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDekMsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtJQUN4QixlQUFNLENBQUMsS0FBSyxDQUFDLDRCQUE0QixFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2xELENBQUMsQ0FBQyxDQUFDO0FBRUgsK0JBQStCO0FBQ2xCLFFBQUEsVUFBVSxHQUFHLElBQUEsNEJBQVMsRUFBQztJQUNsQyxLQUFLLEVBQUUsSUFBSSwwQkFBVSxDQUFDO1FBQ3BCLE1BQU0sRUFBRSxLQUFLO1FBQ2IsTUFBTSxFQUFFLGFBQWE7UUFDckIsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUFFLGFBQWE7S0FDeEMsQ0FBQztJQUNGLFFBQVEsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksRUFBRSxhQUFhO0lBQ3ZDLEdBQUcsRUFBRSxHQUFHLEVBQUUsbUNBQW1DO0lBQzdDLE9BQU8sRUFBRTtRQUNQLEtBQUssRUFBRSx3RUFBd0U7S0FDaEY7SUFDRCxlQUFlLEVBQUUsSUFBSTtJQUNyQixhQUFhLEVBQUUsS0FBSztDQUNyQixDQUFDLENBQUM7QUFFSCx3REFBd0Q7QUFDM0MsUUFBQSxnQkFBZ0IsR0FBRyxJQUFBLDRCQUFTLEVBQUM7SUFDeEMsS0FBSyxFQUFFLElBQUksMEJBQVUsQ0FBQztRQUNwQixNQUFNLEVBQUUsS0FBSztRQUNiLE1BQU0sRUFBRSxrQkFBa0I7UUFDMUIsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUFFLFNBQVM7S0FDcEMsQ0FBQztJQUNGLFFBQVEsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksRUFBRSxTQUFTO0lBQ25DLEdBQUcsRUFBRSxFQUFFLEVBQUUsa0NBQWtDO0lBQzNDLE9BQU8sRUFBRTtRQUNQLEtBQUssRUFBRSxvRUFBb0U7S0FDNUU7SUFDRCxlQUFlLEVBQUUsSUFBSTtJQUNyQixhQUFhLEVBQUUsS0FBSztDQUNyQixDQUFDLENBQUM7QUFFSCxnQ0FBZ0M7QUFDekIsTUFBTSxhQUFhLEdBQUcsQ0FBQyxLQUFhLEVBQVcsRUFBRTtJQUN0RCxJQUFJLENBQUM7UUFDSCxxQ0FBcUM7UUFDckMsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLGVBQU0sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDOUMsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBUlcsUUFBQSxhQUFhLGlCQVF4QjtBQUVGLDhCQUE4QjtBQUN2QixNQUFNLGFBQWEsR0FBRyxDQUFDLE9BQVksRUFBVSxFQUFFO0lBQ3BELElBQUksQ0FBQztRQUNILG1DQUFtQztRQUNuQyxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLGVBQU0sQ0FBQyxLQUFLLENBQUMsc0JBQXNCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUMsTUFBTSxLQUFLLENBQUM7SUFDZCxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBUlcsUUFBQSxhQUFhLGlCQVF4QjtBQUVGLDJCQUEyQjtBQUNkLFFBQUEsUUFBUSxHQUFHLElBQUEscUJBQVcsR0FBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHJhdGVMaW1pdCBmcm9tICdleHByZXNzLXJhdGUtbGltaXQnO1xuaW1wb3J0IFJlZGlzU3RvcmUgZnJvbSAncmF0ZS1saW1pdC1yZWRpcyc7XG5pbXBvcnQgUmVkaXMgZnJvbSAnaW9yZWRpcyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuL2xvZ2dlcic7XG5pbXBvcnQgY29tcHJlc3Npb24gZnJvbSAnY29tcHJlc3Npb24nO1xuaW1wb3J0IHsgUmVxdWVzdEhhbmRsZXIgfSBmcm9tICdleHByZXNzJztcblxuLy8gQ29uZmlndXJhw6fDo28gZG8gY2xpZW50ZSBSZWRpc1xuY29uc3QgcmVkaXMgPSBuZXcgUmVkaXMoe1xuICBob3N0OiBwcm9jZXNzLmVudi5SRURJU19IT1NUIHx8ICdsb2NhbGhvc3QnLFxuICBwb3J0OiBwYXJzZUludChwcm9jZXNzLmVudi5SRURJU19QT1JUIHx8ICc2Mzc5JyksXG4gIHBhc3N3b3JkOiBwcm9jZXNzLmVudi5SRURJU19QQVNTV09SRCxcbiAgcmV0cnlTdHJhdGVneTogKHRpbWVzOiBudW1iZXIpID0+IHtcbiAgICBjb25zdCBkZWxheSA9IE1hdGgubWluKHRpbWVzICogNTAsIDIwMDApO1xuICAgIHJldHVybiBkZWxheTtcbiAgfVxufSk7XG5cbnJlZGlzLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgbG9nZ2VyLmVycm9yKCdFcnJvIG5hIGNvbmV4w6NvIGNvbSBSZWRpczonLCBlcnIpO1xufSk7XG5cbi8vIENvbmZpZ3VyYcOnw6NvIGRvIHJhdGUgbGltaXRlclxuZXhwb3J0IGNvbnN0IGFwaUxpbWl0ZXIgPSByYXRlTGltaXQoe1xuICBzdG9yZTogbmV3IFJlZGlzU3RvcmUoe1xuICAgIGNsaWVudDogcmVkaXMsXG4gICAgcHJlZml4OiAncmF0ZS1saW1pdDonLFxuICAgIHdpbmRvd01zOiAxNSAqIDYwICogMTAwMCwgLy8gMTUgbWludXRvc1xuICB9KSxcbiAgd2luZG93TXM6IDE1ICogNjAgKiAxMDAwLCAvLyAxNSBtaW51dG9zXG4gIG1heDogMTAwLCAvLyBsaW1pdGUgZGUgMTAwIHJlcXVpc2nDp8O1ZXMgcG9yIElQXG4gIG1lc3NhZ2U6IHtcbiAgICBlcnJvcjogJ011aXRhcyByZXF1aXNpw6fDtWVzIGRlc3RlIElQLCBwb3IgZmF2b3IgdGVudGUgbm92YW1lbnRlIGFww7NzIDE1IG1pbnV0b3MnXG4gIH0sXG4gIHN0YW5kYXJkSGVhZGVyczogdHJ1ZSxcbiAgbGVnYWN5SGVhZGVyczogZmFsc2UsXG59KTtcblxuLy8gUmF0ZSBsaW1pdGVyIG1haXMgcmVzdHJpdGl2byBwYXJhIGVuZHBvaW50cyBzZW5zw612ZWlzXG5leHBvcnQgY29uc3Qgc2Vuc2l0aXZlTGltaXRlciA9IHJhdGVMaW1pdCh7XG4gIHN0b3JlOiBuZXcgUmVkaXNTdG9yZSh7XG4gICAgY2xpZW50OiByZWRpcyxcbiAgICBwcmVmaXg6ICdzZW5zaXRpdmUtbGltaXQ6JyxcbiAgICB3aW5kb3dNczogNjAgKiA2MCAqIDEwMDAsIC8vIDEgaG9yYVxuICB9KSxcbiAgd2luZG93TXM6IDYwICogNjAgKiAxMDAwLCAvLyAxIGhvcmFcbiAgbWF4OiAxMCwgLy8gbGltaXRlIGRlIDEwIHJlcXVpc2nDp8O1ZXMgcG9yIElQXG4gIG1lc3NhZ2U6IHtcbiAgICBlcnJvcjogJ011aXRhcyByZXF1aXNpw6fDtWVzIGRlc3RlIElQLCBwb3IgZmF2b3IgdGVudGUgbm92YW1lbnRlIGFww7NzIDEgaG9yYSdcbiAgfSxcbiAgc3RhbmRhcmRIZWFkZXJzOiB0cnVlLFxuICBsZWdhY3lIZWFkZXJzOiBmYWxzZSxcbn0pO1xuXG4vLyBGdW7Dp8OjbyBwYXJhIHZhbGlkYXIgdG9rZW4gSldUXG5leHBvcnQgY29uc3QgdmFsaWRhdGVUb2tlbiA9ICh0b2tlbjogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gIHRyeSB7XG4gICAgLy8gSW1wbGVtZW50YXIgdmFsaWRhw6fDo28gZG8gdG9rZW4gSldUXG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKCdFcnJvIGFvIHZhbGlkYXIgdG9rZW46JywgZXJyb3IpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuLy8gRnVuw6fDo28gcGFyYSBnZXJhciB0b2tlbiBKV1RcbmV4cG9ydCBjb25zdCBnZW5lcmF0ZVRva2VuID0gKHBheWxvYWQ6IGFueSk6IHN0cmluZyA9PiB7XG4gIHRyeSB7XG4gICAgLy8gSW1wbGVtZW50YXIgZ2VyYcOnw6NvIGRvIHRva2VuIEpXVFxuICAgIHJldHVybiAndG9rZW4nO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcignRXJybyBhbyBnZXJhciB0b2tlbjonLCBlcnJvcik7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbi8vIE1pZGRsZXdhcmUgZGUgY29tcHJlc3PDo29cbmV4cG9ydCBjb25zdCBjb21wcmVzcyA9IGNvbXByZXNzaW9uKCk7ICJdfQ==