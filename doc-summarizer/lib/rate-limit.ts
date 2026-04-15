type Bucket = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

const ipBuckets = new Map<string, Bucket>();

export function checkRateLimit(ipAddress: string) {
  const now = Date.now();
  const key = ipAddress || "unknown";
  const current = ipBuckets.get(key);

  if (!current || current.resetAt < now) {
    ipBuckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, retryAfterMs: 0 };
  }

  if (current.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, current.resetAt - now),
    };
  }

  current.count += 1;
  ipBuckets.set(key, current);

  return {
    allowed: true,
    remaining: MAX_REQUESTS - current.count,
    retryAfterMs: 0,
  };
}

