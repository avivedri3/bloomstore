import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly redis?: Redis;
  private readonly memory = new Map<string, { value: string; exp: number }>();

  constructor() {
    const url = process.env.REDIS_URL;
    if (url) {
      this.redis = new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true });
      void this.redis.connect().catch(() => undefined);
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.redis) {
      try {
        return await this.redis.get(key);
      } catch {
        return this.memoryGet(key);
      }
    }
    return this.memoryGet(key);
  }

  async set(key: string, value: string, ttlSeconds = 300): Promise<void> {
    this.memory.set(key, { value, exp: Date.now() + ttlSeconds * 1000 });
    if (this.redis) {
      try {
        await this.redis.set(key, value, 'EX', ttlSeconds);
      } catch {
        /* keep memory copy */
      }
    }
  }

  async del(key: string): Promise<void> {
    this.memory.delete(key);
    if (this.redis) {
      try {
        await this.redis.del(key);
      } catch {
        /* ignore */
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis?.quit();
  }

  private memoryGet(key: string): string | null {
    const hit = this.memory.get(key);
    if (!hit) {
      return null;
    }
    if (hit.exp < Date.now()) {
      this.memory.delete(key);
      return null;
    }
    return hit.value;
  }
}
