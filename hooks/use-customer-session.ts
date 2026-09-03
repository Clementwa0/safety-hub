"use client";

import { useSession } from "next-auth/react";

/**
 * Storefront-scoped wrapper around next-auth's `useSession()`.
 *
 * There's exactly one signed-in identity per browser (one Auth.js
 * session) post-consolidation, so a staff/admin account signed into the
 * Sentinel admin portal is, technically, "authenticated" on the
 * storefront too. But it must never be treated as a signed-in *customer*
 * there: opening the storefront in another tab and clicking "My Account"
 * must not show that staff/admin's own profile as if they were a
 * shopper.
 *
 * Drop-in replacement for `useSession()` in any storefront-facing
 * component - same `{ data, status, update }` shape - except `status`
 * reports `"unauthenticated"` (and `data` is `null`) whenever the
 * underlying session belongs to a staff/admin account rather than a
 * plain customer.
 *
 * The server-side equivalent is `resolveStorefrontCustomer()` in
 * lib/auth/identity.ts - keep the two in sync.
 */
export function useCustomerSession() {
  const session = useSession();

  if (session.status === "authenticated" && session.data?.user?.role !== "customer") {
    return { ...session, data: null, status: "unauthenticated" as const };
  }

  return session;
}
