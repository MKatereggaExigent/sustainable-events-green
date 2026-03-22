import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';

/**
 * Aggressive rate limiter for authentication endpoints
 * Prevents brute force attacks on login/register
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes per IP
  message: {
    error: 'Too many authentication attempts from this IP, please try again after 15 minutes',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  store: new RedisStore({
    // @ts-expect-error - RedisStore types are not fully compatible
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: 'rl:auth:',
  }),
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for auth endpoint: ${req.ip} - ${req.path}`);
    res.status(429).json({
      error: 'Too many authentication attempts from this IP, please try again after 15 minutes',
      retryAfter: 15 * 60,
    });
  },
});

/**
 * Strict rate limiter for password reset
 * Prevents abuse of password reset functionality
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour per IP
  message: {
    error: 'Too many password reset attempts, please try again after 1 hour',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    // @ts-expect-error - RedisStore types are not fully compatible
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: 'rl:pwd:',
  }),
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for password reset: ${req.ip}`);
    res.status(429).json({
      error: 'Too many password reset attempts, please try again after 1 hour',
      retryAfter: 60 * 60,
    });
  },
});

/**
 * General API rate limiter
 * Prevents API abuse
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes per IP
  message: {
    error: 'Too many requests from this IP, please try again later',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    // @ts-expect-error - RedisStore types are not fully compatible
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: 'rl:api:',
  }),
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for API: ${req.ip} - ${req.path}`);
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later',
      retryAfter: 15 * 60,
    });
  },
});

/**
 * Strict rate limiter for calculator endpoint
 * Prevents abuse while allowing legitimate Explorer users (1 event/month)
 */
export const calculatorRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // 5 calculations per day per IP (generous for testing)
  message: {
    error: 'Daily calculation limit reached. Upgrade to Planner for unlimited calculations.',
    retryAfter: 24 * 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    // @ts-expect-error - RedisStore types are not fully compatible
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: 'rl:calc:',
  }),
  handler: (req, res) => {
    logger.warn(`Calculator rate limit exceeded: ${req.ip}`);
    res.status(429).json({
      error: 'Daily calculation limit reached. Upgrade to Planner for unlimited calculations.',
      retryAfter: 24 * 60 * 60,
    });
  },
});

