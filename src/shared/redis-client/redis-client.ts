import Redis from 'ioredis';
import { singleton } from 'tsyringe';
import appConfig from '../../config/app.config';
import logger from '@shared/utils/logger';

@singleton()
export class RedisClient {
  private client: Redis;

  get() {
    this.client = this.client || this.createClient();

    return this.client;
  }

  async close() {
    await this.get().quit();
  }

  private createClient() {
    const retryStrategy = (attempts) => {
      const delay = Math.min(attempts * 1000, 15000);
      return delay;
    };

    const redisClient = new Redis({
      host: appConfig.redis.host,
      port: appConfig.redis.port,
      username: appConfig.redis.username,
      password: appConfig.redis.password,
      showFriendlyErrorStack: true,
      retryStrategy,
      enableOfflineQueue: false,
      maxRetriesPerRequest: null,
      db: 0,
    });

    redisClient.on('error', (err) => {
      logger.error({ err }, 'Redis client connection error');
    });

    redisClient.on('connect', () => {
      logger.info('Redis client has connected to server');
    });

    redisClient.on('ready', () => {
      logger.info('Redis server is ready');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis client is reconnected');
    });

    redisClient.on('close', () => {
      logger.info('Redis connection closed');
    });

    return redisClient;
  }
}
