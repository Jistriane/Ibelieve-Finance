declare module 'rate-limit-redis' {
  import { Redis } from 'ioredis';
  import { Store } from 'express-rate-limit';

  interface RedisStoreOptions {
    client: Redis;
    prefix?: string;
    windowMs?: number;
  }

  class RedisStore implements Store {
    constructor(options: RedisStoreOptions);
    incr(key: string): Promise<number>;
    decrement(key: string): Promise<void>;
    resetKey(key: string): Promise<void>;
  }

  export = RedisStore;
} 