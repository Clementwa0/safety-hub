import bcrypt from "bcryptjs";
import type { IUser } from "@/lib/models/User";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string,
) {
  return bcrypt.compare(password, hash);
}

type SerializableUser = Pick<
  IUser,
  "name" | "email" | "role" | "createdAt"
> & {
  _id?: unknown;
  id?: unknown;
};

export function serializeUser(user: SerializableUser) {
  const createdAt =
    user.createdAt instanceof Date
      ? user.createdAt.toISOString()
      : user.createdAt;

  return {
    id: String(user._id ?? user.id ?? ""),
    name: String(user.name ?? ""),
    email: String(user.email ?? ""),
    role: user.role,
    createdAt,
  };
}