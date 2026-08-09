import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { clearTestDatabase, startTestDatabase, stopTestDatabase } from "../setup/db";

import { CartModel } from "@/lib/models/Cart";
import { StoreOrderModel } from "@/lib/models/StoreOrder";
import { StorefrontCustomerModel } from "@/lib/models/StorefrontCustomer";

beforeAll(startTestDatabase);
afterEach(clearTestDatabase);
afterAll(stopTestDatabase);

async function makeCustomer(role: "customer" | "staff" | "admin" = "customer") {
  return StorefrontCustomerModel.create({
    name: "Test Person",
    email: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
    role,
    status: "active",
  });
}

describe("Cart — single identity ref (post-unification)", () => {
  it("has no userModel field on a created document", async () => {
    const customer = await makeCustomer();
    const cart = await CartModel.create({ user: customer._id, items: [] });

    expect((cart.toObject() as Record<string, unknown>).userModel).toBeUndefined();
  });

  it("resolves `user` against StorefrontCustomer regardless of the account's role — a staff cart works the same as a customer cart", async () => {
    const staff = await makeCustomer("staff");
    const cart = await CartModel.create({ user: staff._id, items: [] });

    const populated = await CartModel.findById(cart._id).populate("user");
    expect((populated?.user as unknown as { role: string })?.role).toBe("staff");
  });

  it("still requires a user or a guest sessionId", async () => {
    await expect(CartModel.create({ items: [] })).rejects.toThrow(
      /must belong to either a user or a guest session/,
    );
  });
});

describe("StoreOrder — single identity ref (post-unification)", () => {
  async function makeOrder(user?: string) {
    return StoreOrderModel.create({
      orderNumber: `TEST-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      user,
      sessionId: user ? undefined : "guest-session-1",
      items: [{ name: "Hard hat", price: 1000, quantity: 1, subtotal: 1000 }],
      subtotal: 1000,
      total: 1000,
      paymentMethod: "cod",
      customer: { name: "Test Person", email: "test@example.com", phone: "0700000000" },
      shippingAddress: { address: "123 Test St", city: "Nairobi", country: "Kenya" },
    });
  }

  it("has no userModel field on a created document", async () => {
    const customer = await makeCustomer();
    const order = await makeOrder(String(customer._id));

    expect((order.toObject() as Record<string, unknown>).userModel).toBeUndefined();
  });

  it("a staff-owned order and a customer-owned order are both just `user` — no precedence/discriminator to resolve between them", async () => {
    const staff = await makeCustomer("staff");
    const customer = await makeCustomer("customer");

    const staffOrder = await makeOrder(String(staff._id));
    const customerOrder = await makeOrder(String(customer._id));

    expect(String(staffOrder.user)).toBe(String(staff._id));
    expect(String(customerOrder.user)).toBe(String(customer._id));
  });
});

describe("StorefrontCustomer — single-admin constraint (carried over from the old User model)", () => {
  it("allows exactly one admin account", async () => {
    await makeCustomer("admin");
    await expect(makeCustomer("admin")).rejects.toThrow(/Only one admin account is allowed/);
  });

  it("allows unlimited customer and staff accounts alongside the one admin", async () => {
    await makeCustomer("admin");
    await expect(makeCustomer("staff")).resolves.toBeTruthy();
    await expect(makeCustomer("staff")).resolves.toBeTruthy();
    await expect(makeCustomer("customer")).resolves.toBeTruthy();
  });

  it("rejects promoting a second account to admin via a role change", async () => {
    await makeCustomer("admin");
    const staff = await makeCustomer("staff");

    staff.role = "admin";
    await expect(staff.save()).rejects.toThrow(/Only one admin account is allowed/);
  });
});
