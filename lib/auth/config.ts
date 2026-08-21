import NextAuth, {
  type NextAuthOptions,
  getServerSession,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

import clientPromise from "@/lib/db/client";
import { connectToDatabase } from "@/lib/db";
import { comparePassword } from "@/lib/auth/sentinel";
import {
  createSentinelSession,
  invalidateSentinelSession,
} from "@/lib/auth/session";
import { linkGuestOrdersToCustomer } from "@/lib/storefront/account-linking";
import { UserModel } from "@/lib/models/User";

const providers = [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID!,
    clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    allowDangerousEmailAccountLinking: true,
  }),

  Facebook({
    clientId: process.env.AUTH_FACEBOOK_ID!,
    clientSecret: process.env.AUTH_FACEBOOK_SECRET!,
    allowDangerousEmailAccountLinking: true,
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

      const user = await UserModel.findOne({
        email,
        role: { $in: ["admin", "staff"] },
        status: "active",
      }).select("+passwordHash +activeSessionId");

      if (!user?.passwordHash) {
        return null;
      }

      const validPassword = await comparePassword(
        password,
        user.passwordHash,
      );

      if (!validPassword) {
        return null;
      }

      const sessionId = await createSentinelSession(
        user._id.toString(),
      );

      return {
        id: user._id.toString(),
        name: user.name ?? "",
        email: user.email,
        image: user.image ?? null,
        role: user.role,
        sid: sessionId,
      };
    },
  }),
];

export const authOptions: NextAuthOptions = {
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
    async signIn({ user, account }) {
      if (!user.email || !account?.provider) {
        return false;
      }

      await connectToDatabase();

      const email = user.email.trim().toLowerCase();

      const identity = await UserModel.findOne({
        email,
      })
        .select("role status")
        .lean();

      if (identity?.status === "suspended") {
        return false;
      }

      if (account.provider === "sentinel-credentials") {
        return identity?.role === "admin" || identity?.role === "staff";
      }

      if (
        account.provider === "google" ||
        account.provider === "facebook"
      ) {
        if (!identity) {
          return true;
        }

        return identity.role === "customer";
      }

      return false;
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "customer";

        if (user.sid) {
          token.sid = user.sid;
        }

        token.invalid = false;
      }

      if (!token.role) {
        token.role = "customer";
      }

      if ((token.role === "admin" || token.role === "staff") && token.id) {
        await connectToDatabase();

        const dbUser = await UserModel.findOne({
          _id: token.id,
          role: { $in: ["admin", "staff"] },
        })
          .select("+activeSessionId status")
          .lean();

        if (
          !dbUser ||
          dbUser.status !== "active" ||
          !token.sid ||
          token.sid !== dbUser.activeSessionId
        ) {
          token.invalid = true;
          return token;
        }
      }

      if (
        token.role === "customer" &&
        token.id &&
        trigger !== "signIn"
      ) {
        await connectToDatabase();

        const dbUser = await UserModel.findOne({
          _id: token.id,
          role: "customer",
        })
          .select("status")
          .lean();

        if (!dbUser || dbUser.status !== "active") {
          token.invalid = true;
          return token;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token.invalid) {
        session.user.id = "";
        session.user.role = "customer";
        return session;
      }

      if (session.user && token.id) {
        session.user.id = token.id;
        session.user.role =
          token.role ?? "customer";
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

      await UserModel.findByIdAndUpdate(user.id, {
        $set: {
          role: "customer",
          status: "active",
        },
      });
    },

    async signIn({ user, account }) {
      if (
        !user.id ||
        !user.email ||
        account?.provider === "sentinel-credentials"
      ) {
        return;
      }

      try {
        await connectToDatabase();

        const identity = await UserModel.findById(user.id)
          .select("role status")
          .lean();

        if (
          !identity ||
          identity.role !== "customer" ||
          identity.status !== "active"
        ) {
          return;
        }

        await linkGuestOrdersToCustomer(
          user.id,
          user.email,
        );
      } catch (error) {
        console.error(
          "Failed to auto-link guest orders on sign-in:",
          error,
        );
      }
    },

    async signOut({ token }) {
      if (
        (token?.role === "admin" || token?.role === "staff") &&
        typeof token.id === "string"
      ) {
        await connectToDatabase();
        await invalidateSentinelSession(token.id);
      }
    },
  },
};

// next-auth@4's NextAuth(authOptions) returns a single App Router request
// handler that serves both GET and POST for app/api/auth/[...nextauth].
const nextAuthHandler = NextAuth(authOptions);

export const handlers = {
  GET: nextAuthHandler,
  POST: nextAuthHandler,
};

// v4 has no server-side `auth()` helper like v5 — this wraps the v4
// equivalent, `getServerSession(authOptions)`, so the rest of the app can
// keep calling `auth()` the same way everywhere.
export async function auth() {
  return getServerSession(authOptions);
}