import type { DefaultSession } from "next-auth";
import type { IdentityRole } from "@/lib/models/StorefrontCustomer";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: IdentityRole;
    } & DefaultSession["user"];
  }

  interface User {
    role?: IdentityRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: IdentityRole;
    /**
     * Only ever set for staff/admin tokens — the single-active-session
     * enforcement key. See the `jwt` callback in lib/auth/config.ts.
     */
    sid?: string;
  }
}
