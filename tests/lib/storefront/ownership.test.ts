import { describe, expect, it } from "vitest";
import { customerOrderFilter, orderBelongsToCustomer, ownerFilter } from "@/lib/storefront/ownership";

describe("ownership helpers (post-identity-unification)", () => {
  describe("ownerFilter", () => {
    it("filters by user alone, with no userModel discriminator", () => {
      expect(ownerFilter("user-1")).toEqual({ user: "user-1" });
    });

    it("merges in extra filter fields without dropping user", () => {
      expect(ownerFilter("user-1", { status: "paid" })).toEqual({
        status: "paid",
        user: "user-1",
      });
    });
  });

  describe("customerOrderFilter", () => {
    it("filters by user alone — a staff account and a customer account are indistinguishable by id alone, which is fine post-unification since there's one identity collection", () => {
      expect(customerOrderFilter("customer-1")).toEqual({ user: "customer-1" });
    });

    it("merges in extra filter fields", () => {
      expect(customerOrderFilter("customer-1", { sessionId: undefined })).toEqual({
        sessionId: undefined,
        user: "customer-1",
      });
    });
  });

  describe("orderBelongsToCustomer", () => {
    it("returns true when the order's user matches, as a string", () => {
      expect(orderBelongsToCustomer({ user: "customer-1" }, "customer-1")).toBe(true);
    });

    it("returns true when the order's user is an ObjectId-like value whose String() matches", () => {
      const objectIdLike = { toString: () => "customer-1" };
      expect(orderBelongsToCustomer({ user: objectIdLike }, "customer-1")).toBe(true);
    });

    it("returns false when the user does not match", () => {
      expect(orderBelongsToCustomer({ user: "customer-2" }, "customer-1")).toBe(false);
    });

    it("returns false for a guest order (no user set)", () => {
      expect(orderBelongsToCustomer({ user: undefined }, "customer-1")).toBe(false);
      expect(orderBelongsToCustomer({ user: null }, "customer-1")).toBe(false);
    });
  });
});
