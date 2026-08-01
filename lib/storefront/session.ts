import { randomUUID } from "crypto";
import type { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export const CART_SESSION_COOKIE = "cart_session";
const CART_SESSION_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

export interface CartIdentity {
  /** Set when the request comes from an authenticated (staff/admin) user. */
  userId?: string;
  /** Set for guest carts, identified by an opaque cookie value. */
  sessionId?: string;
  /** True when a session cookie had to be minted for this request. */
  isNewSession: boolean;
}

/**
 * Resolves who a cart/order request belongs to.
 *
 * This project's only authentication system (`lib/auth.ts`) issues JWTs for
 * Sentinel staff/admin accounts — there is no public customer login. So for
 * the storefront, every unauthenticated visitor is treated as a guest
 * identified by a long-lived, httpOnly session cookie. If a logged-in
 * staff/admin user happens to shop, we key their cart to their user id
 * instead so the two systems stay consistent with each other.
 */
export async function resolveCartIdentity(request: NextRequest): Promise<CartIdentity> {
  const user = await getAuthenticatedUser();

  if (user) {
    return { userId: String(user._id), isNewSession: false };
  }

  const existing = request.cookies.get(CART_SESSION_COOKIE)?.value;

  if (existing) {
    return { sessionId: existing, isNewSession: false };
  }

  return { sessionId: randomUUID(), isNewSession: true };
}

/** Attaches the guest session cookie to a response if one was just minted. */
export function persistCartIdentity(response: NextResponse, identity: CartIdentity) {
  if (identity.isNewSession && identity.sessionId) {
    response.cookies.set({
      name: CART_SESSION_COOKIE,
      value: identity.sessionId,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: CART_SESSION_MAX_AGE,
    });
  }
}
