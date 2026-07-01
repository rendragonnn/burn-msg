import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

/**
 * Distributed rate limiter using Redis INCR + EXPIRE.
 * Works across serverless cold starts and multiple instances.
 *
 * @param {string} identifier - Unique key (e.g. IP address)
 * @param {number} maxRequests - Max requests allowed in window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Promise<{ allowed: boolean, retryAfter?: number }>}
 */
export async function rateLimit(identifier, maxRequests = 10, windowMs = 60_000) {
  const windowSec = Math.ceil(windowMs / 1000);
  const key = `rl:${identifier}`;

  const p = redis.pipeline();
  p.incr(key);
  p.ttl(key);
  const [count, ttl] = await p.exec();

  // Set TTL if this is the first request, or if the key has no TTL (self-healing after a crash)
  if (count === 1 || ttl === -1) {
    await redis.expire(key, windowSec);
  }

  if (count > maxRequests) {
    return { allowed: false, retryAfter: ttl > 0 ? ttl : windowSec };
  }

  return { allowed: true };
}
