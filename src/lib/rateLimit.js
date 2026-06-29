const rateMap = new Map();

export function rateLimit(ip, maxRequests = 10, windowMs = 60_000) {
  const now = Date.now();

  // Lazy cleanup — sweep stale entries on each call (serverless-safe, no setInterval)
  for (const [key, record] of rateMap) {
    if (now - record.start > record.windowMs) rateMap.delete(key);
  }

  const record = rateMap.get(ip);

  if (!record || now - record.start > windowMs) {
    rateMap.set(ip, { start: now, count: 1, windowMs });
    return { allowed: true };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((windowMs - (now - record.start)) / 1000) };
  }

  record.count++;
  return { allowed: true };
}
