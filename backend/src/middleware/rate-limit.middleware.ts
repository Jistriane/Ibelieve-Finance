import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { environment } from '../config/environment';

const redis = new Redis(environment.REDIS_URL);

export const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const ip = req.ip;
  const key = `rate-limit:${ip}`;

  try {
    const requests = await redis.incr(key);
    
    if (requests === 1) {
      await redis.expire(key, environment.RATE_LIMIT_WINDOW / 1000);
    }

    if (requests > environment.RATE_LIMIT_MAX) {
      res.status(429).json({
        message: 'Muitas requisições. Por favor, tente novamente mais tarde.',
        retryAfter: await redis.ttl(key)
      });
      return;
    }

    res.setHeader('X-RateLimit-Limit', environment.RATE_LIMIT_MAX);
    res.setHeader('X-RateLimit-Remaining', environment.RATE_LIMIT_MAX - requests);
    
    next();
  } catch (error) {
    console.error('Erro no rate limiting:', error);
    next();
  }
}; 