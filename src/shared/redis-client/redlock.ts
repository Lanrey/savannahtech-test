import Redis from 'ioredis';
import Redlock, { ResourceLockedError } from 'redlock';
import { container } from 'tsyringe';
import { RedisClient } from './redis-client';
import logger from '@shared/utils/logger';

const redisClient: Redis = container.resolve(RedisClient).get();

const initializeRedlock = () => {
  const redlock = new Redlock([redisClient], { retryCount: 0 });

  redlock.on('error', (err) => {
    if (err instanceof ResourceLockedError) {
      return;
    }

    logger.error({ err });
  });

  return redlock;
};

export default initializeRedlock;
