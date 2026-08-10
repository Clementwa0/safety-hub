import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));

vi.mock("@/lib/auth", () => ({ auth: authMock }));

import { resolveStorefrontCustomer, resolveSentinelUser } from "@/lib/storefront/identity";

describe("resolveStorefrontCustomer", () => {
  beforeEach(() => {
    authMock.mockReset();
  });

  it("resolves a plain customer session", async () => {
    authMock.mockResolvedValue({
      user: { id: "cust-1", role: "customer", email: "a@b.com", name: "Ann", image: null },
    });

    const customer = await resolveStorefrontCustomer();

    expect(customer).toEqual({ id: "cust-1", email: "a@b.com", name: "Ann", image: null });
  });

  it("never resolves a staff session as a customer — signed into Sentinel in one tab must not surface as 'My Account' on the storefront", async () => {
    authMock.mockResolvedValue({ user: { id: "staff-1", role: "staff", email: "staff@shop.com" } });

    expect(await resolveStorefrontCustomer()).toBeNull();
  });

  it("never resolves an admin session as a customer, same as staff", async () => {
    authMock.mockResolvedValue({ user: { id: "admin-1", role: "admin", email: "admin@shop.com" } });

    expect(await resolveStorefrontCustomer()).toBeNull();
  });

  it("returns null when nobody is signed in", async () => {
    authMock.mockResolvedValue(null);

    expect(await resolveStorefrontCustomer()).toBeNull();
  });
});

describe("resolveSentinelUser", () => {
  beforeEach(() => {
    authMock.mockReset();
  });

  it("resolves a staff/admin session", async () => {
    authMock.mockResolvedValue({ user: { id: "staff-1", role: "staff" } });

    expect(await resolveSentinelUser()).toEqual({ id: "staff-1", role: "staff" });
  });

  it("returns null for a plain customer session — mirror image of resolveStorefrontCustomer's exclusion", async () => {
    authMock.mockResolvedValue({ user: { id: "cust-1", role: "customer" } });

    expect(await resolveSentinelUser()).toBeNull();
  });
});
