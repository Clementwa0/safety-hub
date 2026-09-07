import { apiError } from "@/lib/api";
import { checkRateLimit, getClientRateLimitKey, type RateLimitPolicy } from "@/lib/rate-limit";

export function enforceRateLimit(request: Request, scope: string, policy: RateLimitPolicy) {
  const result = checkRateLimit(scope, getClientRateLimitKey(request), policy);
  if (result.allowed) return null;

  return apiError(
    "Too many requests. Please try again later.",
    [],
    429,
    {
      "Retry-After": String(result.retryAfterSeconds),
      "X-RateLimit-Limit": String(policy.limit),
      "X-RateLimit-Remaining": "0",
    },
  );
}
