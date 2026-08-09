import { randomUUID } from "crypto";
import type { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CART_SESSION_COOKIE } from "@/lib/storefront/constants";

export { CART_SESSION_COOKIE };
const CART_SESSION_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

export interface CartIdentity {
  /** Set when there is any signed-in user — staff, admin, or storefront customer alike. */
  userId?: string;
  /** Set for guest carts, identified by an opaque cookie value. */
  sessionId?: string;
  /** True when a session cookie had to be minted for this request. */
  isNewSession: boolean;
}

/**
 * Resolves who a cart/order request belongs to.
 *
 * Post-unification there is exactly one sign-in mechanism and one session
 * per browser, so this just reads it — a signed-in user (whether their
 * role is customer, staff, or admin) owns the cart/order under their own
 * id, with no precedence question between a "staff session" and a
 * "customer session" left to resolve, because there's only ever one.
 *
 * Falls back to a guest, identified by a long-lived, httpOnly session
 * cookie, when nobody is signed in.
 *
 * (This used to check a separate storefront-customer session first and a
 * separate Sentinel staff session second, specifically so a browser
 * holding both never had orders silently attributed to the staff account
 * instead of the customer's own — see git history on this file. Full
 * session unification removes the second session entirely, so that
 * precedence logic no longer applies.)
 */
export async function resolveCartIdentity(request: NextRequest): Promise<CartIdentity> {
  const session = await auth();

  if (session?.user?.id) {
    return { userId: session.user.id, isNewSession: false };
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
