import { getAuthenticatedUser } from "@/lib/auth";
import { auth as getCustomerAuthSession } from "@/lib/customer-auth";

export interface StorefrontCustomerIdentity {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
}

export interface SentinelUserIdentity {
  id: string;
  role: string;
}

/**
 * Resolves the signed-in storefront customer for this request — and ONLY
 * the storefront customer.
 *
 * This never falls back to, or is influenced by, a Sentinel staff/admin
 * session. Every customer-facing account/order endpoint (account
 * overview, "my orders", order detail, address book, guest-order linking,
 * etc.) must resolve identity through this helper rather than through
 * `resolveCartIdentity()` in `lib/storefront/session.ts`. That helper
 * intentionally checks a Sentinel staff session *first* — the right
 * precedence for the cart/checkout flow, where a staff member shopping
 * should get their own staff-linked cart — but it is the wrong precedence
 * for the account dashboard: a staff member who also has a storefront
 * customer account signed in in the same browser must still see *their
 * own customer* data on `/account/*`, never data resolved against their
 * staff id.
 *
 * Returns `null` if there is no signed-in storefront customer, regardless
 * of whether a Sentinel staff session exists.
 */
export async function resolveStorefrontCustomer(): Promise<StorefrontCustomerIdentity | null> {
  const session = await getCustomerAuthSession();

  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    name: session.user.name ?? null,
    image: session.user.image ?? null,
  };
}

/**
 * Resolves the signed-in Sentinel staff/admin user for this request — and
 * ONLY the Sentinel identity. Never resolves, or falls back to, a
 * storefront customer session.
 *
 * Thin, purpose-specific wrapper around `getAuthenticatedUser()` (the
 * existing JWT-based Sentinel resolver in `lib/auth.ts`), kept here so
 * Sentinel-only call sites have the same explicit, single-purpose shape as
 * `resolveStorefrontCustomer()` and so the two identity systems are never
 * casually interchanged.
 */
export async function resolveSentinelUser(): Promise<SentinelUserIdentity | null> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return null;
  }

  return { id: String(user._id), role: String(user.role ?? "staff") };
}
