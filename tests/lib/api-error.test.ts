import assert from "node:assert/strict";
import test from "node:test";

import { apiError } from "@/lib/api";

test("5xx API responses never expose an exception message or details", async () => {
  const response = apiError("MongoServerError: credentials leaked", ["stack trace"], 500);
  const payload = await response.json();

  assert.equal(response.status, 500);
  assert.deepEqual(payload, {
    success: false,
    message: "An unexpected server error occurred.",
    errors: [],
  });
});

test("client-safe 4xx validation messages remain actionable", async () => {
  const response = apiError("Validation failed", ["Email is required"], 400);
  const payload = await response.json();

  assert.equal(payload.message, "Validation failed");
  assert.deepEqual(payload.errors, ["Email is required"]);
});
