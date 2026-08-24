import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { recordPaymentSchema, voidPaymentSchema } from "@/lib/validation/payment";

describe("recordPaymentSchema", () => {
  it("accepts a valid cash payment", () => {
    const result = recordPaymentSchema.safeParse({ amount: 500, method: "cash" });
    assert.equal(result.success, true);
  });

  it("accepts a valid mpesa payment with reference and notes", () => {
    const result = recordPaymentSchema.safeParse({
      amount: 1500.5,
      method: "mpesa",
      reference: "QWE123",
      notes: "Paid via till",
    });
    assert.equal(result.success, true);
  });

  it("rejects a zero amount", () => {
    const result = recordPaymentSchema.safeParse({ amount: 0, method: "cash" });
    assert.equal(result.success, false);
  });

  it("rejects a negative amount", () => {
    const result = recordPaymentSchema.safeParse({ amount: -100, method: "cash" });
    assert.equal(result.success, false);
  });

  it("rejects a missing amount", () => {
    const result = recordPaymentSchema.safeParse({ method: "cash" });
    assert.equal(result.success, false);
  });

  it("rejects an unknown payment method", () => {
    const result = recordPaymentSchema.safeParse({ amount: 100, method: "bank_transfer" });
    assert.equal(result.success, false);
  });

  it("rejects a string amount (must be a real number, not a form string)", () => {
    const result = recordPaymentSchema.safeParse({ amount: "500", method: "cash" });
    assert.equal(result.success, false);
  });
});

describe("voidPaymentSchema", () => {
  it("accepts an empty body (reason is optional)", () => {
    const result = voidPaymentSchema.safeParse({});
    assert.equal(result.success, true);
  });

  it("accepts a reason string", () => {
    const result = voidPaymentSchema.safeParse({ reason: "Customer disputed the charge" });
    assert.equal(result.success, true);
  });

  it("rejects a reason over 500 characters", () => {
    const result = voidPaymentSchema.safeParse({ reason: "x".repeat(501) });
    assert.equal(result.success, false);
  });
});
