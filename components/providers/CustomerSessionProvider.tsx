"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

/**
 * Wraps the app so any client component can call `useSession()` to read the
 * storefront customer's sign-in state (Navbar avatar, sign-in page,
 * checkout-success "save this order" prompt, etc.). This has nothing to do
 * with the staff/admin auth in `lib/auth.ts` — it only ever reflects the
 * Auth.js customer session.
 */
export function CustomerSessionProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
