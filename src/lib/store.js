import { Redis } from '@upstash/redis';

// Initialize Redis client. This requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars.
const redis = Redis.fromEnv();

export async function createMessage({ id, ciphertext, iv, hasPassword, passwordHash, expiresAt, burnTime, maxReads = 1, audio = null, telegramId = null }) {
  const msgObj = {
    ciphertext,
    iv,
    hasPassword: !!hasPassword,
    passwordHash: passwordHash || null,
    expiresAt,
    burnTime,
    maxReads,
    audio,
    telegramId,
    reads: 0,
    burned: false,
    createdAt: Date.now(),
  };

  // Convert logical expiresAt timestamp to TTL in seconds
  const ttl = Math.max(1, Math.floor((expiresAt - Date.now()) / 1000));
  
  await redis.hset(`msg:${id}`, msgObj);
  await redis.expire(`msg:${id}`, ttl);
  
  return id;
}

export async function getMessage(id) {
  const msg = await redis.hgetall(`msg:${id}`);
  if (!msg || Object.keys(msg).length === 0) return null;
  return msg;
}

export async function claimMessageRead(id, maxReads) {
  // Atomically increment read count FIRST to prevent TOCTOU race conditions
  const newReads = await redis.hincrby(`msg:${id}`, 'reads', 1);
  
  if (newReads > maxReads) {
    return null; // Quota exceeded!
  }
  
  if (newReads === maxReads) {
    // Burn the payload immediately on the final read
    await redis.hset(`msg:${id}`, {
      burned: true,
      ciphertext: null,
      iv: null,
      passwordHash: null,
      audio: null,
    });
  }
  return newReads;
}

export async function messageExists(id) {
  const exists = await redis.exists(`msg:${id}`);
  if (!exists) return false;
  
  const msg = await redis.hgetall(`msg:${id}`);
  if (msg.expiresAt <= Date.now()) {
    await redis.del(`msg:${id}`);
    return false;
  }
  return true;
}
