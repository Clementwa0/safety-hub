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

/**
 * Any signed-in Sentinel user — admin or staff. Staff have the same
 * portal access as admin EXCEPT Users, Settings, and Reports, which are
 * gated separately with requireAdmin() at the route/page level.
 */
export async function requireStaff() {
  const user = await requireAuth();

  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    return null;
  }

  return user;
}