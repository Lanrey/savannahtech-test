import { injectable } from 'tsyringe';
import { Redis } from 'ioredis';
import { RedisClient } from '@shared/redis-client/redis-client';

@injectable()
export class CacheService {
  private redisClient: Redis;

  constructor(redisClient: RedisClient) {
    this.redisClient = redisClient.get();
  }

  async get(key: string): Promise<any | null> {
    const value = await this.redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, expirationInSeconds?: number): Promise<void> {
    const stringValue = JSON.stringify(value);
    if (expirationInSeconds) {
      await this.redisClient.set(key, stringValue, 'EX', expirationInSeconds);
    } else {
      await this.redisClient.set(key, stringValue);
    }
  }

  async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }

  async clearRepositoryCache(owner: string, repo: string): Promise<void> {
    const keys = [`repository:${owner}:${repo}`, `commits:${owner}:${repo}`, `topAuthors:${owner}:${repo}`];

    await Promise.all(keys.map((key) => this.del(key)));
  }
}
