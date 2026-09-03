import { randomUUID } from "crypto";

export interface CartIdentity {
  /** Set only for a signed-in storefront customer (role `"customer"`).
   *  Never set for admin/staff - see `resolveCartIdentityFromSession()`
   *  below. */
  userId?: string;
  /** Set for guest carts (including a signed-in admin/staff browsing the
   *  storefront), identified by an opaque cookie value. */
  sessionId?: string;
  /** True when a session cookie had to be minted for this request. */
  isNewSession: boolean;
}

/** The subset of an Auth.js session this module reads. Kept minimal and
 *  structural (rather than importing next-auth's `Session` type) so this
 *  file has no dependency on next-auth/next itself - it stays a plain,
 *  synchronous rule that's easy to unit test with a plain object. */
export interface CartSessionLike {
  user?: {
    id?: string | null;
    role?: string | null;
  } | null;
}

/**
 * Pure decision logic behind `resolveCartIdentity` (see
 * `modules/cart/session.ts`, the thin I/O wrapper around this that
 * actually calls `auth()` and reads the request's cookies). Split into
 * its own dependency-free module so this rule can be unit tested
 * directly, without mocking `auth()` or `next/server`'s cookie jar.
 * Keep the two in sync.
 *
 * Only a signed-in plain `customer` owns the cart/order under their own
 * id. A signed-in admin/staff account browsing the storefront (there's
 * exactly one sign-in mechanism and one session per browser
 * post-unification, so this is a real case - a admin's own browser
 * session is technically "signed in" on the storefront too) must never
 * have a cart or order attached to their user id: an admin has no
 * business owning a storefront cart, and doing so would let an admin's
 * Sentinel identity collide with the customer-facing account/order
 * surfaces (`/account`, order history, abandoned-cart emails, etc. all
 * key off `Cart.user`/`StoreOrder.user`). Such a session instead falls
 * through to the same guest-cookie path as a signed-out visitor - see
 * `resolveStorefrontCustomer()` in `lib/auth/identity.ts`, which
 * applies the identical role check for the read-only "who is this
 * customer" case and must be kept in sync with this one.
 *
 * Falls back to a guest, identified by a long-lived, httpOnly session
 * cookie, when nobody is signed in (or the signed-in user isn't a
 * customer).
 *
 * (This used to check a separate storefront-customer session first and a
 * separate Sentinel admin session second, specifically so a browser
 * holding both never had orders silently attributed to the admin account
 * instead of the customer's own - see git history on this file. Full
 * session unification collapsed both into a single Auth.js session, but
 * the same admin/customer separation still has to be enforced here by
 * role, since there's no longer a separate session to fall back on.)
 */
export function resolveCartIdentityFromSession(
  session: CartSessionLike | null | undefined,
  existingSessionCookie: string | undefined,
): CartIdentity {
  if (session?.user?.id && session.user.role === "customer") {
    return { userId: session.user.id, isNewSession: false };
  }

  if (existingSessionCookie) {
    return { sessionId: existingSessionCookie, isNewSession: false };
  }

  return { sessionId: randomUUID(), isNewSession: true };
}
