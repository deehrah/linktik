import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../lib/redis';

// Auth endpoints - strict limit (5 attempts per 15 minutes)
export const authLimiter = rateLimit({
  store: new (RedisStore as any)({
    client: redis,
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

// API endpoints - moderate limit (100 requests per minute)
export const apiLimiter = rateLimit({
  store: new (RedisStore as any)({
    client: redis,
    prefix: 'rl:api:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many requests, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

// Redirect endpoint - very permissive (1000 per minute, as these are public)
export const redirectLimiter = rateLimit({
  store: new (RedisStore as any)({
    client: redis,
    prefix: 'rl:redirect:',
  }),
  windowMs: 60 * 1000,
  max: 1000,
  message: 'Rate limit exceeded for redirects',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

// Webhook endpoint - special handling for Paystack signatures
export const webhookLimiter = rateLimit({
  store: new (RedisStore as any)({
    client: redis,
    prefix: 'rl:webhook:',
  }),
  windowMs: 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
});
