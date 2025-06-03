import { createClient } from 'redis';
import { config } from './config';

// Cliente Redis
export const redisClient = createClient({
  url: config.redis.url,
  password: config.redis.password,
  database: config.redis.db
});

// Conectar ao Redis
redisClient.connect().catch((error) => {
  console.error('Erro ao conectar ao Redis:', error);
});

// Eventos do cliente Redis
redisClient.on('connect', () => {
  console.log('Conectado ao Redis');
});

redisClient.on('error', (error) => {
  console.error('Erro no Redis:', error);
});

redisClient.on('reconnecting', () => {
  console.log('Reconectando ao Redis...');
});

// Funções auxiliares
export const redisHelper = {
  // Definir valor com TTL
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);
    if (ttl) {
      await redisClient.setEx(`${config.cache.prefix}${key}`, ttl, serializedValue);
    } else {
      await redisClient.set(`${config.cache.prefix}${key}`, serializedValue);
    }
  },

  // Obter valor
  async get<T>(key: string): Promise<T | null> {
    const value = await redisClient.get(`${config.cache.prefix}${key}`);
    if (!value) return null;
    return JSON.parse(value) as T;
  },

  // Deletar valor
  async del(key: string): Promise<void> {
    await redisClient.del(`${config.cache.prefix}${key}`);
  },

  // Verificar se chave existe
  async exists(key: string): Promise<boolean> {
    const exists = await redisClient.exists(`${config.cache.prefix}${key}`);
    return exists === 1;
  },

  // Definir TTL
  async expire(key: string, ttl: number): Promise<void> {
    await redisClient.expire(`${config.cache.prefix}${key}`, ttl);
  },

  // Obter TTL
  async ttl(key: string): Promise<number> {
    return await redisClient.ttl(`${config.cache.prefix}${key}`);
  },

  // Limpar todas as chaves com prefixo
  async clear(): Promise<void> {
    const keys = await redisClient.keys(`${config.cache.prefix}*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  }
}; 