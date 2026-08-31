import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { getAvailableQuantity } from "@/types/product";

describe("getAvailableQuantity", () => {
  it("subtracts reservations from simple-product stock", () => {
    assert.equal(getAvailableQuantity({ stock: 8, reserved: 3 }), 5);
  });

  it("never exposes a negative sellable quantity", () => {
    assert.equal(getAvailableQuantity({ stock: 2, reserved: 3 }), 0);
  });

  it("supports pre-reservation records", () => {
    assert.equal(getAvailableQuantity({ stock: 4 }), 4);
  });
});
