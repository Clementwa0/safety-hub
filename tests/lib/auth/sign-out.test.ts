import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { clearTestDatabase, startTestDatabase, stopTestDatabase } from "../../setup/db";

import { handleSentinelSignOut } from "@/lib/auth/sign-out";
import { StorefrontCustomerModel } from "@/lib/models/StorefrontCustomer";

beforeAll(startTestDatabase);
afterEach(clearTestDatabase);
afterAll(stopTestDatabase);

describe("handleSentinelSignOut (the signOut event — invalidateSession wiring)", () => {
  it("REGRESSION: clears activeSessionId for a staff account on sign-out, so a copied JWT can't keep working", async () => {
    const staff = await StorefrontCustomerModel.create({
      name: "Staff Person",
      email: "staff@example.com",
      role: "staff",
      status: "active",
      activeSessionId: "session-abc",
    });

    await handleSentinelSignOut({ token: { id: String(staff._id), role: "staff" } });

    const updated = await StorefrontCustomerModel.findById(staff._id).select("+activeSessionId");
    expect(updated?.activeSessionId).toBeNull();
  });

  it("also clears it for an admin account", async () => {
    const admin = await StorefrontCustomerModel.create({
      name: "Admin Person",
      email: "admin@example.com",
      role: "admin",
      status: "active",
      activeSessionId: "session-xyz",
    });

    await handleSentinelSignOut({ token: { id: String(admin._id), role: "admin" } });

    const updated = await StorefrontCustomerModel.findById(admin._id).select("+activeSessionId");
    expect(updated?.activeSessionId).toBeNull();
  });

  it("does nothing for an ordinary customer sign-out (no single-session enforcement to clear)", async () => {
    const customer = await StorefrontCustomerModel.create({
      name: "Customer Person",
      email: "customer@example.com",
      role: "customer",
      status: "active",
    });

    // Should not throw, and should not touch the document.
    await expect(
      handleSentinelSignOut({ token: { id: String(customer._id), role: "customer" } }),
    ).resolves.toBeUndefined();
  });

  it("does nothing when the event fires with a database-strategy `{ session }` shape (defensive — this config only ever uses JWT strategy)", async () => {
    await expect(handleSentinelSignOut({ session: null })).resolves.toBeUndefined();
  });

  it("does nothing when there's no token or no id", async () => {
    await expect(handleSentinelSignOut({ token: null })).resolves.toBeUndefined();
    await expect(handleSentinelSignOut({ token: { role: "staff" } })).resolves.toBeUndefined();
  });
});
