import { Redis } from '@upstash/redis';

// Initialize Redis client. This requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars.
const redis = Redis.fromEnv();

const MAX_FAILED_ATTEMPTS = 5;

export async function createMessage({ id, ciphertext, iv, hasPassword, passwordHash, passwordSalt, expiresAt, burnTime, maxReads = 1, audio = null, telegramId = null }) {
  const msgObj = {
    ciphertext,
    iv,
    hasPassword: !!hasPassword,
    passwordHash: passwordHash || null,
    passwordSalt: passwordSalt || null,
    expiresAt,
    burnTime,
    maxReads,
    audio,
    telegramId,
    reads: 0,
    burned: false,
    failedAttempts: 0,
    createdAt: Date.now(),
  };

  // Convert logical expiresAt timestamp to TTL in seconds
  const ttl = Math.max(1, Math.floor((expiresAt - Date.now()) / 1000));
  
  await redis.hset(`msg:${id}`, msgObj);
  await redis.expire(`msg:${id}`, ttl);
  
  return id;
}

/**
 * Get message metadata only (no ciphertext).
 * Used for initial GET to check password requirement, burned status, etc.
 */
export async function getMessageMeta(id) {
  const msg = await redis.hgetall(`msg:${id}`);
  if (!msg || Object.keys(msg).length === 0) return null;
  if (msg.expiresAt <= Date.now()) {
    await redis.del(`msg:${id}`);
    return null;
  }
  // Return metadata only — never ciphertext or passwordHash here
  return {
    hasPassword: msg.hasPassword,
    passwordSalt: msg.passwordSalt,
    burned: msg.burned,
    maxReads: msg.maxReads,
    burnTime: msg.burnTime,
    createdAt: msg.createdAt,
    telegramId: msg.telegramId,
    failedAttempts: msg.failedAttempts || 0,
  };
}

/**
 * Get the password hash for verification. Separate from getMessageMeta
 * to avoid accidental exposure of credentials.
 */
export async function getPasswordHash(id) {
  return await redis.hget(`msg:${id}`, 'passwordHash');
}

/**
 * Atomically claim a read slot AND return ciphertext only if successful.
 * Eliminates the TOCTOU race condition by doing claim-first, read-second.
 *
 * Returns: { ciphertext, iv, audio, burnTime, createdAt, currentRead, maxReads } on success
 * Returns: null if quota exceeded (burned)
 */
export async function claimMessageRead(id) {
  // Step 1: Atomically increment read count
  const newReads = await redis.hincrby(`msg:${id}`, 'reads', 1);

  // Step 2: Read maxReads from Redis (single source of truth)
  const maxReads = await redis.hget(`msg:${id}`, 'maxReads');
  const maxReadsNum = Number(maxReads);

  if (newReads > maxReadsNum) {
    // Undo the increment — this reader came too late
    await redis.hincrby(`msg:${id}`, 'reads', -1);
    return null;
  }

  // Step 3: Only NOW read the sensitive data
  const [ciphertext, iv, audio, burnTime, createdAt] = await Promise.all([
    redis.hget(`msg:${id}`, 'ciphertext'),
    redis.hget(`msg:${id}`, 'iv'),
    redis.hget(`msg:${id}`, 'audio'),
    redis.hget(`msg:${id}`, 'burnTime'),
    redis.hget(`msg:${id}`, 'createdAt'),
  ]);

  // Edge case: ciphertext was nulled (e.g. by recordFailedAttempt) between claim and read
  if (!ciphertext) {
    await redis.hincrby(`msg:${id}`, 'reads', -1);
    return null;
  }

  // Step 4: If this was the final read, burn the payload
  if (newReads === maxReadsNum) {
    await redis.hset(`msg:${id}`, {
      burned: true,
      ciphertext: null,
      iv: null,
      passwordHash: null,
      audio: null,
    });
  }

  return {
    ciphertext,
    iv,
    audio: audio || null,
    burnTime: burnTime ?? 30,
    createdAt,
    currentRead: newReads,
    maxReads: maxReadsNum,
  };
}

/**
 * Record a failed password attempt. Auto-burns message after MAX_FAILED_ATTEMPTS.
 * Returns: { burned: boolean, attemptsLeft: number }
 */
export async function recordFailedAttempt(id) {
  const attempts = await redis.hincrby(`msg:${id}`, 'failedAttempts', 1);

  if (attempts >= MAX_FAILED_ATTEMPTS) {
    // Auto-burn: too many failed attempts
    await redis.hset(`msg:${id}`, {
      burned: true,
      ciphertext: null,
      iv: null,
      passwordHash: null,
      audio: null,
    });
    return { burned: true, attemptsLeft: 0 };
  }

  return { burned: false, attemptsLeft: MAX_FAILED_ATTEMPTS - attempts };
}
