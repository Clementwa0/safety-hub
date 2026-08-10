import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Nodemailer from "next-auth/providers/nodemailer";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

import clientPromise from "@/lib/db/client";
import { connectToDatabase } from "@/lib/db";
import { comparePassword } from "@/lib/auth/sentinel";
import { createSession } from "@/lib/auth/session";
import { handleSentinelSignOut } from "@/lib/auth/sign-out";
import { linkGuestOrdersToCustomer } from "@/lib/storefront/account-linking";
import { StorefrontCustomerModel } from "@/lib/models/StorefrontCustomer";

const EMAIL_FROM = process.env.AUTH_EMAIL_FROM || "no-reply@example.com";

const providers: NextAuthConfig["providers"] = [
  Google({
    allowDangerousEmailAccountLinking: true,
  }),
  Facebook({
    allowDangerousEmailAccountLinking: true,
  }),
 Credentials({
    id: "sentinel-credentials",
    name: "Sentinel",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
      const password = typeof credentials?.password === "string" ? credentials.password : "";

      if (!email || !password) return null;

      await connectToDatabase();

      const user = await StorefrontCustomerModel.findOne({
        email,
        role: { $in: ["staff", "admin"] },
      }).select("+passwordHash +activeSessionId");

      if (!user || !user.passwordHash) return null;
      if (user.status === "suspended") return null;

      const validPassword = await comparePassword(password, user.passwordHash);
      if (!validPassword) return null;

      // Starting a new session here invalidates whatever session was
      // previously active on this account, so signing in anywhere new
      // silently signs it out everywhere else — same guarantee the old
      // custom-JWT system provided.
      const sessionId = await createSession(user._id.toString());

      return {
        id: user._id.toString(),
        name: user.name ?? "",
        email: user.email,
        image: user.image ?? null,
        role: user.role,
        // Passed through to the `jwt` callback via the `user` param on
        // this same sign-in call only — see below.
        sid: sessionId,
      } as { id: string; name: string; email: string; image: string | null; role: "staff" | "admin"; sid: string };
    },
  }),
];

if (process.env.AUTH_EMAIL_SERVER_HOST) {
  providers.push(
    Nodemailer({
      server: {
        host: process.env.AUTH_EMAIL_SERVER_HOST,
        port: Number(process.env.AUTH_EMAIL_SERVER_PORT || 587),
        auth: {
          user: process.env.AUTH_EMAIL_SERVER_USER,
          pass: process.env.AUTH_EMAIL_SERVER_PASSWORD,
        },
      },
      from: EMAIL_FROM,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,

  adapter: MongoDBAdapter(clientPromise, {
    collections: {
      Users: "storefront_customers",
      Accounts: "storefront_accounts",
      Sessions: "storefront_sessions",
      VerificationTokens: "storefront_verification_tokens",
    },
  }),

  providers,

  // Required because a Credentials provider is present — Auth.js does not
  // support adapter-persisted ("database") sessions together with
  // Credentials. The adapter is still used (and still required) for
  // Google/Facebook account linking and email-provider verification
  // tokens; only the *session* itself is now a signed JWT rather than a
  // row in the Sessions collection. This also means every request now
  // authenticates by verifying a signed cookie instead of the previous
  // per-request `getAuthenticatedUser()` DB read for Sentinel — a
  // deliberate exception is a fresh DB read for staff/admin tokens (see
  // the `jwt` callback below) to preserve single-session enforcement.
  session: {
    strategy: "jwt",
  },

  secret: process.env.AUTH_SECRET,

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      // `user` is only present on the initial sign-in call.
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "customer";
        const sid = (user as { sid?: string }).sid;
        if (sid) token.sid = sid;
      }

      // Backfill role for tokens that predate this migration or that
      // otherwise lack it (shouldn't normally happen, but fail closed to
      // "customer" rather than leaving it undefined).
      if (!token.role) token.role = "customer";

      // Staff/admin tokens carry a `sid` and must be re-validated against
      // the DB on every request: if a newer login (or a logout) changed
      // activeSessionId, or the account was suspended, this token is
      // stale and must stop working immediately rather than at its
      // natural expiry. This mirrors exactly what the old
      // getAuthenticatedUser() did on every Sentinel request.
      if ((token.role === "staff" || token.role === "admin") && token.id && trigger !== "signIn") {
        await connectToDatabase();
        const dbUser = await StorefrontCustomerModel.findById(token.id)
          .select("+activeSessionId")
          .lean();

        if (!dbUser || dbUser.status === "suspended" || !token.sid || token.sid !== dbUser.activeSessionId) {
          // Returning null invalidates the token — the next auth() call
          // reports no session at all, which is what forces a stale or
          // suspended Sentinel session to stop working immediately.
          return null;
        }

        // Role may have changed (e.g. demoted from admin to staff, or
        // promoted) since the token was issued — keep it current.
        token.role = dbUser.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as typeof session.user.role) ?? "customer";
      }

      return session;
    },
  },

  events: {
    // Fires only when the ADAPTER creates a brand-new user document — i.e.
    // the first time someone signs in via Google/Facebook/email. Backfills
    // `role`/`status`, which the adapter itself has no concept of. This is
    // the ONLY place a new account's role is set from an OAuth/email
    // sign-in, and it is always "customer" — staff/admin accounts are
    // never created this way, regardless of email address or domain.
    async createUser({ user }) {
      if (!user.id) return;
      await connectToDatabase();
      await StorefrontCustomerModel.findByIdAndUpdate(user.id, {
        $set: { role: "customer", status: "active" },
      });
    },

    async signIn({ user }) {
      if (!user.id || !user.email) return;

      try {
        await connectToDatabase();
        await linkGuestOrdersToCustomer(user.id, user.email);
      } catch (error) {
        console.error("Failed to auto-link guest orders on sign-in:", error);
      }
    },

    // See handleSentinelSignOut's header comment in ./sign-out.ts for why
    // this exists and why it's a separate module.
    signOut: handleSentinelSignOut,
  },
});
