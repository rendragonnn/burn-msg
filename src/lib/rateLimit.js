const rateMap = new Map();

// Periodically clean stale entries to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateMap) {
    if (now - record.start > record.windowMs) rateMap.delete(key);
  }
}, 60_000);

export function rateLimit(ip, maxRequests = 10, windowMs = 60_000) {
  const now = Date.now();
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
