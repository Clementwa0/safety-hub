/**
 * Small, dependency-free fixed-window limiter for routes that are exposed to
 * the internet or trigger costly work. It is intentionally process-local:
 * production deployments with multiple instances should replace this store
 * with a shared Redis/edge implementation before relying on it for quotas.
 */
export interface RateLimitPolicy {
  limit: number;
  windowMs: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function getClientRateLimitKey(request: Request): string {
  // These headers are set by the hosting reverse proxy. Never accept a
  // client-provided identity from the request body or query string.
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return ip.slice(0, 128);
}

export function checkRateLimit(
  scope: string,
  key: string,
  policy: RateLimitPolicy,
  now = Date.now(),
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const bucketKey = `${scope}:${key}`;
  const existing = buckets.get(bucketKey);
  const bucket = !existing || existing.resetAt <= now
    ? { count: 0, resetAt: now + policy.windowMs }
    : existing;

  bucket.count += 1;
  buckets.set(bucketKey, bucket);

  // Opportunistic cleanup keeps a long-lived development process bounded.
  if (buckets.size > 10_000) {
    for (const [storedKey, storedBucket] of buckets) {
      if (storedBucket.resetAt <= now) buckets.delete(storedKey);
    }
  }

  const remaining = Math.max(0, policy.limit - bucket.count);
  return {
    allowed: bucket.count <= policy.limit,
    remaining,
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

/** Test-only isolation hook; it is not imported by application code. */
export function resetRateLimitStoreForTests() {
  buckets.clear();
}
