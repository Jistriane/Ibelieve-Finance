interface RateLimitConfig {
  ENABLED: boolean;
  MAX_REQUESTS_PER_MINUTE: number;
  WINDOW_MS: number;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private limits: Map<string, RateLimitRecord>;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.limits = new Map();
    this.config = config;

    // Inicia a limpeza periódica dos registros
    if (this.config.ENABLED) {
      setInterval(() => this.cleanup(), this.config.WINDOW_MS);
    }
  }

  public async checkLimit(ip: string): Promise<boolean> {
    if (!this.config.ENABLED) {
      return true;
    }

    const now = Date.now();
    const record = this.limits.get(ip);

    // Se não há registro para este IP, cria um novo
    if (!record) {
      this.limits.set(ip, {
        count: 1,
        resetTime: now + this.config.WINDOW_MS,
      });
      return true;
    }

    // Se o tempo de reset já passou, reinicia o contador
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + this.config.WINDOW_MS;
      return true;
    }

    // Verifica se o limite foi atingido
    if (record.count >= this.config.MAX_REQUESTS_PER_MINUTE) {
      return false;
    }

    // Incrementa o contador
    record.count++;
    return true;
  }

  public getRemainingRequests(ip: string): number {
    if (!this.config.ENABLED) {
      return Infinity;
    }

    const record = this.limits.get(ip);
    if (!record) {
      return this.config.MAX_REQUESTS_PER_MINUTE;
    }

    if (Date.now() > record.resetTime) {
      return this.config.MAX_REQUESTS_PER_MINUTE;
    }

    return Math.max(0, this.config.MAX_REQUESTS_PER_MINUTE - record.count);
  }

  public getResetTime(ip: string): number {
    const record = this.limits.get(ip);
    return record ? record.resetTime : Date.now() + this.config.WINDOW_MS;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [ip, record] of this.limits.entries()) {
      if (now > record.resetTime) {
        this.limits.delete(ip);
      }
    }
  }
} 