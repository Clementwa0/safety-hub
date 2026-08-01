import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserModel } from "./models/User";
import { connectToDatabase } from "./db";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

function getJwtSecret() {
  if (process.env.NODE_ENV === "production" && !JWT_SECRET) {
    throw new Error("JWT_SECRET must be configured in production");
  }

  return JWT_SECRET || "dev-secret";
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: object) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as { sub: string; role: string };
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: "auth_token",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function serializeUser(user: Record<string, unknown>) {
  const createdAt = user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt;
  return {
    id: String(user._id ?? user.id ?? ""),
    name: String(user.name ?? ""),
    email: String(user.email ?? ""),
    role: String(user.role ?? "staff"),
    createdAt,
  };
}

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = verifyToken(token);
    await connectToDatabase();
    const user = await UserModel.findById(payload.sub).lean().select("-password");
    return user;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getAuthenticatedUser();

  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    return null;
  }

  return user;
}
