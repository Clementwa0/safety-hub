import type { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CART_SESSION_COOKIE } from "@/modules/cart/constants";
import { resolveCartIdentityFromSession, type CartIdentity } from "@/modules/cart/cart-identity-rules";

export { CART_SESSION_COOKIE };
export type { CartIdentity };
const CART_SESSION_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

/** Resolves who a cart/order request belongs to. The actual rule
 *  (admin/staff never own a cart/order, only a signed-in `customer`
 *  does) lives in `resolveCartIdentityFromSession` in
 *  `modules/cart/cart-identity-rules.ts` - this is just the I/O
 *  wrapper that calls `auth()` and reads the request's cookies. */
export async function resolveCartIdentity(request: NextRequest): Promise<CartIdentity> {
  const session = await auth();
  const existing = request.cookies.get(CART_SESSION_COOKIE)?.value;

  return resolveCartIdentityFromSession(session, existing);
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
