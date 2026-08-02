import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

import clientPromise from "@/lib/mongodb-client";
import { connectToDatabase } from "@/lib/db";
import { linkGuestOrdersToCustomer } from "@/lib/storefront/account-linking";

const EMAIL_FROM = process.env.AUTH_EMAIL_FROM || "no-reply@example.com";

const providers: NextAuthConfig["providers"] = [
  Google({
    allowDangerousEmailAccountLinking: true,
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

  session: {
    strategy: "database",
  },

  secret: process.env.AUTH_SECRET,

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-storefront_customer.session-token"
          : "storefront_customer.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  pages: {
    signIn: "/account/sign-in",
    verifyRequest: "/account/sign-in",
  },

  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }

      return session;
    },
  },

  events: {
    async signIn({ user }) {
      if (!user.id || !user.email) return;

      try {
        await connectToDatabase();
        await linkGuestOrdersToCustomer(user.id, user.email);
      } catch (error) {
        console.error(
          "Failed to auto-link guest orders on sign-in:",
          error,
        );
      }
    },
  },
});