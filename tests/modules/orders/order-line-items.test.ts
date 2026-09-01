import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  areOrderItemsLocked,
  areOrderLineItemsUnchanged,
} from "@/modules/orders/order-line-items";
import {
  canDeleteConvertedQuotation,
  canDeleteOrderStatus,
  canMutateCommercialReference,
} from "@/modules/orders/order-status";

const existing = [{
  productId: "product-1",
  name: "Safety helmet",
  description: undefined,
  variantSku: "HELMET-M",
  size: "M",
  quantity: 2,
  unitPrice: 1_500,
  taxRate: 16,
  discount: 0,
}];

const requested = [{
  id: "client-line-id",
  productId: "product-1",
  name: "Safety helmet",
  description: "",
  variantSku: "HELMET-M",
  size: "M",
  quantity: 2,
  unitPrice: 1_500,
  taxRate: 16,
  discount: 0,
}];

describe("shipped order line-item protection", () => {
  it("locks commercial lines only once an order has shipped or been delivered", () => {
    assert.equal(areOrderItemsLocked("pending"), false);
    assert.equal(areOrderItemsLocked("confirmed"), false);
    assert.equal(areOrderItemsLocked("processing"), false);
    assert.equal(areOrderItemsLocked("cancelled"), false);
    assert.equal(areOrderItemsLocked("shipped"), true);
    assert.equal(areOrderItemsLocked("delivered"), true);
  });

  it("allows deleting editable orders but blocks historical ones", () => {
    assert.equal(canDeleteOrderStatus("pending"), true);
    assert.equal(canDeleteOrderStatus("confirmed"), true);
    assert.equal(canDeleteOrderStatus("processing"), true);
    assert.equal(canDeleteOrderStatus("shipped"), false);
    assert.equal(canDeleteOrderStatus("delivered"), false);
    assert.equal(canDeleteOrderStatus("cancelled"), false);
  });

  it("keeps converted quotations and order references immutable", () => {
    assert.equal(canDeleteConvertedQuotation({ orderId: "quote-order-link" }), false);
    assert.equal(canDeleteConvertedQuotation({}), true);
    assert.equal(canMutateCommercialReference("quote-1", "quote-2"), false);
    assert.equal(canMutateCommercialReference(undefined, "quote-2"), true);
    assert.equal(canMutateCommercialReference("quote-1", undefined), true);
  });

  it("accepts an unchanged client round-trip for a historical order", () => {
    assert.equal(areOrderLineItemsUnchanged(existing, requested), true);
  });

  it("detects item, quantity, product, and variant changes", () => {
    assert.equal(
      areOrderLineItemsUnchanged(existing, [{ ...requested[0], name: "Replacement helmet" }]),
      false,
    );
    assert.equal(
      areOrderLineItemsUnchanged(existing, [{ ...requested[0], quantity: 3 }]),
      false,
    );
    assert.equal(
      areOrderLineItemsUnchanged(existing, [{ ...requested[0], productId: "product-2" }]),
      false,
    );
    assert.equal(
      areOrderLineItemsUnchanged(existing, [{ ...requested[0], variantSku: "HELMET-L", size: "L" }]),
      false,
    );
  });

  it("detects additions, removals, and other commercial value changes", () => {
    assert.equal(areOrderLineItemsUnchanged(existing, []), false);
    assert.equal(
      areOrderLineItemsUnchanged(existing, [{ ...requested[0], unitPrice: 1_600 }]),
      false,
    );
  });
});
