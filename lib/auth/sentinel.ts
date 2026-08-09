// Password hashing utilities for the Credentials (staff/admin) provider,
// and the serializeUser() helper used by the /api/users management
// endpoints. Token signing/verification and cookie handling used to live
// here too (the old custom-JWT system) — that's gone; Auth.js in
// ./index.ts owns sessions entirely now.
import bcrypt from "bcryptjs";
import type { IStorefrontCustomer } from "../models/StorefrontCustomer";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

type SerializableUser = Pick<IStorefrontCustomer, "name" | "email" | "role" | "createdAt"> & {
  _id?: unknown;
  id?: unknown;
};

export function serializeUser(user: SerializableUser) {
  const createdAt = user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt;
  return {
    id: String(user._id ?? user.id ?? ""),
    name: String(user.name ?? ""),
    email: String(user.email ?? ""),
    role: String(user.role ?? "staff"),
    createdAt,
  };
}
