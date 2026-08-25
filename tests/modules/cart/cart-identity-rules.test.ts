import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { resolveCartIdentityFromSession } from "@/modules/cart/cart-identity-rules";

describe("resolveCartIdentityFromSession", () => {
  it("attaches userId for a signed-in customer", () => {
    const identity = resolveCartIdentityFromSession(
      { user: { id: "customer-1", role: "customer" } },
      undefined,
    );

    assert.equal(identity.userId, "customer-1");
    assert.equal(identity.sessionId, undefined);
    assert.equal(identity.isNewSession, false);
  });

  it("treats a signed-in admin as a guest, not a customer", () => {
    const identity = resolveCartIdentityFromSession(
      { user: { id: "admin-1", role: "admin" } },
      undefined,
    );

    assert.equal(identity.userId, undefined);
    assert.equal(typeof identity.sessionId, "string");
    assert.equal(identity.isNewSession, true);
  });

  it("treats a signed-in staff account as a guest, not a customer", () => {
    const identity = resolveCartIdentityFromSession(
      { user: { id: "staff-1", role: "staff" } },
      undefined,
    );

    assert.equal(identity.userId, undefined);
    assert.equal(typeof identity.sessionId, "string");
    assert.equal(identity.isNewSession, true);
  });

  it("reuses an admin's existing guest cookie instead of minting a new one", () => {
    const identity = resolveCartIdentityFromSession(
      { user: { id: "admin-1", role: "admin" } },
      "existing-guest-session-id",
    );

    assert.equal(identity.userId, undefined);
    assert.equal(identity.sessionId, "existing-guest-session-id");
    assert.equal(identity.isNewSession, false);
  });

  it("reuses an existing guest cookie for a signed-out visitor", () => {
    const identity = resolveCartIdentityFromSession(null, "existing-guest-session-id");

    assert.equal(identity.userId, undefined);
    assert.equal(identity.sessionId, "existing-guest-session-id");
    assert.equal(identity.isNewSession, false);
  });

  it("mints a new guest session for a signed-out visitor with no cookie", () => {
    const identity = resolveCartIdentityFromSession(null, undefined);

    assert.equal(identity.userId, undefined);
    assert.equal(typeof identity.sessionId, "string");
    assert.equal(identity.isNewSession, true);
  });

  it("treats a session with no user id as signed out", () => {
    const identity = resolveCartIdentityFromSession({ user: { role: "customer" } }, "cookie-1");

    assert.equal(identity.userId, undefined);
    assert.equal(identity.sessionId, "cookie-1");
  });
});
