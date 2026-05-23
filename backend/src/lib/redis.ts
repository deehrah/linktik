import Redis from 'ioredis';
import env from '../config/env';

const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  enableOfflineQueue: false,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

export default redis;
