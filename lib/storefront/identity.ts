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
 * "who is this person for account/order purposes", regardless of role.
 * Post-consolidation there's exactly one signed-in identity per browser
 * (one Auth.js session), so this simply reads it; a staff/admin user
 * browsing the storefront resolves to their own account here too, same
 * as a plain customer would.
 *
 * Returns `null` if there is no signed-in user at all.
 */
export async function resolveStorefrontCustomer(): Promise<StorefrontCustomerIdentity | null> {
  const session = await auth();

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
 * Resolves the signed-in user as a Sentinel identity, ONLY if their role
 * is staff or admin. Returns `null` for a signed-out visitor or a signed-in
 * plain customer — callers that need Sentinel authorization should
 * generally prefer requireStaff()/requireAdmin() from lib/auth/permissions
 * over this, which exists mainly for read-only "is there a staff session"
 * checks (e.g. lib/storefront/session.ts's cart identity resolution).
 */
export async function resolveSentinelUser(): Promise<SentinelUserIdentity | null> {
  const session = await auth();

  if (!session?.user?.id || (session.user.role !== "staff" && session.user.role !== "admin")) {
    return null;
  }

  return { id: session.user.id, role: session.user.role };
}
