import Redis from 'ioredis';
import { config } from './index';
import { logger } from '../utils/logger';

export const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  logger.info('Redis connection established');
});

redis.on('error', (err) => {
  logger.error('Redis error:', err);
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

// Session and cache utilities
export const SESSION_PREFIX = 'session:';
export const CACHE_PREFIX = 'cache:';

export async function setSession(userId: string, sessionData: any, ttl: number = 86400): Promise<void> {
  await redis.setex(`${SESSION_PREFIX}${userId}`, ttl, JSON.stringify(sessionData));
}

export async function getSession(userId: string): Promise<any | null> {
  const data = await redis.get(`${SESSION_PREFIX}${userId}`);
  return data ? JSON.parse(data) : null;
}

export async function deleteSession(userId: string): Promise<void> {
  await redis.del(`${SESSION_PREFIX}${userId}`);
}

export async function setCache(key: string, data: any, ttl: number = 3600): Promise<void> {
  await redis.setex(`${CACHE_PREFIX}${key}`, ttl, JSON.stringify(data));
}

export async function getCache(key: string): Promise<any | null> {
  const data = await redis.get(`${CACHE_PREFIX}${key}`);
  return data ? JSON.parse(data) : null;
}

export async function deleteCache(key: string): Promise<void> {
  await redis.del(`${CACHE_PREFIX}${key}`);
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  const keys = await redis.keys(`${CACHE_PREFIX}${pattern}`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

export default redis;

