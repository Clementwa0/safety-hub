import { randomUUID } from "crypto";
import type { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { auth as getCustomerAuthSession } from "@/lib/customer-auth";
import type { CartUserModel } from "@/lib/models/Cart";
import { CART_SESSION_COOKIE } from "@/lib/storefront/constants";

export { CART_SESSION_COOKIE };
const CART_SESSION_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

export interface CartIdentity {
  /** Set when the request comes from an authenticated (staff/admin) user, or a signed-in storefront customer. */
  userId?: string;
  /** Which model `userId` refers to — only meaningful when `userId` is set. */
  userModel?: CartUserModel;
  /** Set for guest carts, identified by an opaque cookie value. */
  sessionId?: string;
  /** True when a session cookie had to be minted for this request. */
  isNewSession: boolean;
}

/**
 * Resolves who a cart/order request belongs to.
 *
 * Three possible identities, checked in this order:
 *
 *  1. A logged-in Sentinel staff/admin user (`lib/auth.ts`, JWT in the
 *     `auth_token` cookie) — pre-existing behavior, unchanged: if a
 *     staff/admin happens to shop, their cart is keyed to their staff user
 *     id so the two systems stay consistent with each other.
 *  2. A signed-in storefront customer account (`lib/customer-auth.ts`,
 *     Auth.js database session) — the new optional account layer.
 *  3. Otherwise, a guest, identified by a long-lived, httpOnly session
 *     cookie — this remains the default, zero-friction path for anyone who
 *     hasn't created an account, and is completely unaffected by either of
 *     the above.
 */
export async function resolveCartIdentity(request: NextRequest): Promise<CartIdentity> {
  const staffUser = await getAuthenticatedUser();

  if (staffUser) {
    return { userId: String(staffUser._id), userModel: "User", isNewSession: false };
  }

  const customerSession = await getCustomerAuthSession();

  if (customerSession?.user?.id) {
    return { userId: customerSession.user.id, userModel: "StorefrontCustomer", isNewSession: false };
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
