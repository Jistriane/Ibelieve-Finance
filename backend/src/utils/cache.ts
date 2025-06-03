interface CacheConfig {
  ENABLED: boolean;
  TTL: number;
  MAX_SIZE: number;
}

interface CacheItem<T> {
  value: T;
  timestamp: number;
}

export class Cache {
  private cache: Map<string, CacheItem<any>>;
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.cache = new Map();
    this.config = config;

    // Inicia a limpeza periódica do cache
    if (this.config.ENABLED) {
      setInterval(() => this.cleanup(), this.config.TTL);
    }
  }

  public get<T>(key: string): T | null {
    if (!this.config.ENABLED) {
      return null;
    }

    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    // Verifica se o item expirou
    if (Date.now() - item.timestamp > this.config.TTL) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  public set<T>(key: string, value: T): void {
    if (!this.config.ENABLED) {
      return;
    }

    // Verifica se o cache atingiu o tamanho máximo
    if (this.cache.size >= this.config.MAX_SIZE) {
      // Remove o item mais antigo
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.config.TTL) {
        this.cache.delete(key);
      }
    }
  }

  private getOldestKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestKey = key;
        oldestTimestamp = item.timestamp;
      }
    }

    return oldestKey;
  }
} 