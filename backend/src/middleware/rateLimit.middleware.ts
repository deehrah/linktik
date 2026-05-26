import rateLimit from 'express-rate-limit';
import RedisStore, { type RedisReply } from 'rate-limit-redis';
import { redis } from '../lib/redis';

const commonOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: any) => process.env.NODE_ENV === 'test',
};

const createRedisStore = (prefix: string) =>
  new RedisStore({
    prefix,
    sendCommand: async (command: string, ...args: string[]) =>
      redis.call(command, ...args) as Promise<RedisReply>,
  });

export const authLimiter = rateLimit({
  // Use Redis-backed store in production; fall back to the default in-memory
  // store during development to avoid Redis init warnings locally.
  store: process.env.NODE_ENV === 'production' ? createRedisStore('rl:auth:') : undefined,
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 50,
  message: 'Too many login attempts, please try again later',
  ...commonOptions,
});

export const apiLimiter = rateLimit({
  store: process.env.NODE_ENV === 'production' ? createRedisStore('rl:api:') : undefined,
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests, please slow down',
  ...commonOptions,
});

export const redirectLimiter = rateLimit({
  store: process.env.NODE_ENV === 'production' ? createRedisStore('rl:redirect:') : undefined,
  windowMs: 60 * 1000,
  max: 1000,
  ...commonOptions,
});

export const webhookLimiter = rateLimit({
  store: process.env.NODE_ENV === 'production' ? createRedisStore('rl:webhook:') : undefined,
  windowMs: 60 * 1000,
  max: 500,
  ...commonOptions,
});
