interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
}

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly defaultTTL: number = 5 * 60 * 1000; // 5 minutos

  private constructor() {
    // Limpar cache expirado a cada minuto
    setInterval(() => this.cleanExpiredCache(), 60 * 1000);
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private cleanExpiredCache() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  set<T>(key: string, value: T, ttl: number = this.defaultTTL): void {
    const now = Date.now();
    this.cache.set(key, {
      value,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Métodos específicos para cache de negócio
  setWalletData(address: string, data: any): void {
    this.set(`wallet:${address}`, data);
  }

  getWalletData(address: string): any {
    return this.get(`wallet:${address}`);
  }

  setRiskAnalysis(address: string, data: any): void {
    this.set(`risk:${address}`, data, 30 * 60 * 1000); // 30 minutos
  }

  getRiskAnalysis(address: string): any {
    return this.get(`risk:${address}`);
  }

  setZKProof(address: string, proof: string): void {
    this.set(`zkproof:${address}`, proof, 60 * 60 * 1000); // 1 hora
  }

  getZKProof(address: string): string | null {
    return this.get(`zkproof:${address}`);
  }
} 