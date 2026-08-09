import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));

vi.mock("@/lib/auth", () => ({ auth: authMock }));

import { CART_SESSION_COOKIE, resolveCartIdentity } from "@/lib/storefront/session";

function fakeRequest(cookieValue?: string): NextRequest {
  return {
    cookies: {
      get: (name: string) =>
        name === CART_SESSION_COOKIE && cookieValue ? { name, value: cookieValue } : undefined,
    },
  } as unknown as NextRequest;
}

describe("resolveCartIdentity (single unified session)", () => {
  beforeEach(() => {
    authMock.mockReset();
  });

  it("resolves to the signed-in user's id, regardless of role — a staff/admin session and a customer session are the same mechanism now", async () => {
    authMock.mockResolvedValue({ user: { id: "user-abc", role: "staff" } });

    const identity = await resolveCartIdentity(fakeRequest());

    expect(identity).toEqual({ userId: "user-abc", isNewSession: false });
  });

  it("never falls back to a guest cookie when a session exists, even if one is also present", async () => {
    authMock.mockResolvedValue({ user: { id: "user-abc", role: "customer" } });

    const identity = await resolveCartIdentity(fakeRequest("some-guest-cookie"));

    expect(identity.userId).toBe("user-abc");
    expect(identity.sessionId).toBeUndefined();
  });

  it("falls back to the existing guest cookie when nobody is signed in", async () => {
    authMock.mockResolvedValue(null);

    const identity = await resolveCartIdentity(fakeRequest("existing-guest-id"));

    expect(identity).toEqual({ sessionId: "existing-guest-id", isNewSession: false });
  });

  it("mints a new guest session id when there's no session and no existing cookie", async () => {
    authMock.mockResolvedValue(null);

    const identity = await resolveCartIdentity(fakeRequest());

    expect(identity.isNewSession).toBe(true);
    expect(identity.userId).toBeUndefined();
    expect(typeof identity.sessionId).toBe("string");
    expect(identity.sessionId).toHaveLength(36); // UUID
  });

  it("treats a session with no user id the same as no session (defensive — a malformed/expired token shouldn't silently own a cart)", async () => {
    authMock.mockResolvedValue({ user: {} });

    const identity = await resolveCartIdentity(fakeRequest("existing-guest-id"));

    expect(identity).toEqual({ sessionId: "existing-guest-id", isNewSession: false });
  });
});
