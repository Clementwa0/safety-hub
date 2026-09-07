import assert from "node:assert/strict";
import test from "node:test";

import { checkRateLimit, resetRateLimitStoreForTests } from "@/lib/rate-limit";

test("rate limit permits the configured quota then returns a retry time", () => {
  resetRateLimitStoreForTests();
  const policy = { limit: 2, windowMs: 10_000 };

  assert.equal(checkRateLimit("contact", "203.0.113.8", policy, 1_000).allowed, true);
  assert.equal(checkRateLimit("contact", "203.0.113.8", policy, 1_001).remaining, 0);

  const blocked = checkRateLimit("contact", "203.0.113.8", policy, 1_002);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSeconds, 10);
});

test("rate limit keys are independent by endpoint and reset window", () => {
  resetRateLimitStoreForTests();
  const policy = { limit: 1, windowMs: 1_000 };

  checkRateLimit("checkout", "203.0.113.8", policy, 1_000);
  assert.equal(checkRateLimit("contact", "203.0.113.8", policy, 1_001).allowed, true);
  assert.equal(checkRateLimit("checkout", "203.0.113.8", policy, 2_000).allowed, true);
});
