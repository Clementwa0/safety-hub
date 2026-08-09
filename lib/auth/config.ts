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

const EMAIL_FROM =
  process.env.AUTH_EMAIL_FROM || "no-reply@example.com";

const providers: NextAuthConfig["providers"] = [
  Google({
    allowDangerousEmailAccountLinking: true,
  }),

  Facebook({
    allowDangerousEmailAccountLinking: true,
    authorization: {
      params: {
        scope: "public_profile,email",
      },
    },
  }),

  Credentials({
    id: "sentinel-credentials",
    name: "Sentinel",

    credentials: {
      email: {
        label: "Email",
        type: "email",
      },
      password: {
        label: "Password",
        type: "password",
      },
    },

    async authorize(credentials) {
      const email =
        typeof credentials?.email === "string"
          ? credentials.email.trim().toLowerCase()
          : "";

      const password =
        typeof credentials?.password === "string"
          ? credentials.password
          : "";

      if (!email || !password) {
        return null;
      }

      await connectToDatabase();

      const user = await StorefrontCustomerModel.findOne({
        email,
        role: {
          $in: ["staff", "admin"],
        },
      }).select("+passwordHash +activeSessionId");

      if (!user || !user.passwordHash) {
        return null;
      }

      if (user.status === "suspended") {
        return null;
      }

      const validPassword = await comparePassword(
        password,
        user.passwordHash
      );

      if (!validPassword) {
        return null;
      }

      const sessionId = await createSession(user._id.toString());

      return {
        id: user._id.toString(),
        name: user.name ?? "",
        email: user.email,
        image: user.image ?? null,
        role: user.role,
        sid: sessionId,
      } as {
        id: string;
        name: string;
        email: string;
        image: string | null;
        role: "staff" | "admin";
        sid: string;
      };
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
    })
  );
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
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
    strategy: "jwt",
  },

  secret: process.env.AUTH_SECRET,

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "customer";

        const sid = (user as { sid?: string }).sid;

        if (sid) {
          token.sid = sid;
        }
      }

      if (!token.role) {
        token.role = "customer";
      }

      if (
        (token.role === "staff" || token.role === "admin") &&
        token.id &&
        trigger !== "signIn"
      ) {
        await connectToDatabase();

        const dbUser = await StorefrontCustomerModel.findById(
          token.id
        )
          .select("+activeSessionId")
          .lean();

        if (
          !dbUser ||
          dbUser.status === "suspended" ||
          !token.sid ||
          token.sid !== dbUser.activeSessionId
        ) {
          return null;
        }

        token.role = dbUser.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;

        session.user.role =
          (token.role as typeof session.user.role) ?? "customer";
      }

      return session;
    },
  },

  events: {
    async createUser({ user }) {
      if (!user.id) {
        return;
      }

      await connectToDatabase();

      await StorefrontCustomerModel.findByIdAndUpdate(user.id, {
        $set: {
          role: "customer",
          status: "active",
        },
      });
    },

    async signIn({ user }) {
      if (!user.id || !user.email) {
        return;
      }

      try {
        await connectToDatabase();

        await linkGuestOrdersToCustomer(
          user.id,
          user.email
        );
      } catch (error) {
        console.error(
          "Failed to auto-link guest orders on sign-in:",
          error
        );
      }
    },

    signOut: handleSentinelSignOut,
  },
});
