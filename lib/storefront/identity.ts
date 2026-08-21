import { auth } from "@/lib/auth";

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
 * Resolves the signed-in user as a storefront customer identity — i.e.
 * "who is this person for account/order purposes" — but ONLY when their
 * role is a plain customer.
 *
 * There's exactly one signed-in identity per browser (one Auth.js
 * session) post-consolidation, so a admin account signed into the
 * Sentinel portal is, technically, "signed in" on the storefront too. But
 * it must never resolve as a customer here: opening the storefront in
 * another tab and clicking "My Account" must not show that admin's
 * own account as if they were a shopper. Returns `null` for that case,
 * same as a signed-out visitor — callers (the /api/account/* routes,
 * checkout's email-pinning, etc.) already treat `null` as "no customer
 * session", so a admin browsing the storefront is handled exactly
 * like a guest for every customer-facing purpose. Order/cart ownership
 * for a signed-in admin is unaffected — that's `resolveCartIdentity`
 * in lib/storefront/session.ts, a separate, intentionally broader check.
 *
 * The client-side equivalent is `useCustomerSession()` in
 * hooks/use-customer-session.ts — keep the two in sync.
 *
 * Returns `null` if there is no signed-in user, or the signed-in user is
 * admin.
 */
export async function resolveStorefrontCustomer(): Promise<StorefrontCustomerIdentity | null> {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "customer") {
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
 * Resolves the signed-in user as a Sentinel identity, ONLY if their role
 * is admin or staff. Returns `null` for a signed-out visitor or a
 * signed-in plain customer — callers that need Sentinel authorization
 * should generally prefer requireAdmin()/requireStaff() from
 * lib/auth/permissions over this, which exists mainly for read-only "is
 * there a Sentinel session" checks (e.g. lib/storefront/session.ts's
 * cart identity resolution).
 */
export async function resolveSentinelUser(): Promise<SentinelUserIdentity | null> {
  const session = await auth();

  if (
    !session?.user?.id ||
    (session.user.role !== "admin" && session.user.role !== "staff")
  ) {
    return null;
  }

  return { id: session.user.id, role: session.user.role };
}
