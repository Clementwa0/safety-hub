import { auth } from "./config";

export async function requireAuth() {
  const session = await auth();

  return session?.user ?? null;
}

export async function requireCustomer() {
  const user = await requireAuth();

  if (!user || user.role !== "customer") {
    return null;
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();

  if (!user || user.role !== "admin") {
    return null;
  }

  return user;
}