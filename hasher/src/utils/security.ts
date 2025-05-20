import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { logger } from './logger';
import compression from 'compression';
import { RequestHandler } from 'express';

// Configuração do cliente Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (err) => {
  logger.error('Erro na conexão com Redis:', err);
});

// Configuração do rate limiter
export const apiLimiter = rateLimit({
  store: new RedisStore({
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
export const sensitiveLimiter = rateLimit({
  store: new RedisStore({
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
export const validateToken = (token: string): boolean => {
  try {
    // Implementar validação do token JWT
    return true;
  } catch (error) {
    logger.error('Erro ao validar token:', error);
    return false;
  }
};

// Função para gerar token JWT
export const generateToken = (payload: any): string => {
  try {
    // Implementar geração do token JWT
    return 'token';
  } catch (error) {
    logger.error('Erro ao gerar token:', error);
    throw error;
  }
};

// Middleware de compressão
export const compress = compression(); 