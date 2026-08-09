import { auth } from "./config";

/**
 * Returns the signed-in user (any role) for this request, or null.
 * The single entry point every other require*() helper below builds on —
 * all identity now comes from the one Auth.js session.
 */
export async function requireAuth() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Returns the signed-in user ONLY if their role is "customer". Use this
 * to gate customer-facing functionality (account, checkout, orders,
 * addresses) so Sentinel staff/admin credentials can't be used to hit
 * customer-only APIs.
 *
 * This is deliberately strict, not "any authenticated role" — staff/admin
 * get their own access via requireStaff()/requireAdmin(), and mixing the
 * two here would make it easy for a customer-only endpoint to accidentally
 * accept a staff session. If a specific storefront flow genuinely needs to
 * let staff shop as themselves, add an explicit requireCustomerOrStaff()
 * for that call site rather than loosening this one.
 *
 * Ownership checks (a customer only seeing their OWN orders/addresses)
 * are enforced separately at each call site by comparing
 * resource.customerId to this user's id — never inferred from role.
 */
export async function requireCustomer() {
  const user = await requireAuth();

  if (!user || user.role !== "customer") {
    return null;
  }

  return user;
}

/**
 * Returns the signed-in user if they are staff OR admin — i.e. any
 * signed-in staff member. Use this for routine day-to-day Sentinel
 * operations (managing products, orders, quotations, invoices, etc.)
 * that any staff member should be able to perform.
 */
export async function requireStaff() {
  const user = await requireAuth();

  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    return null;
  }

  return user;
}

/**
 * Returns the signed-in user ONLY if their role is "admin". Use this to
 * gate admin-only actions (customer/staff records, user management, and
 * other sensitive operations) that a regular staff account must not be
 * able to perform.
 */
export async function requireAdmin() {
  const user = await requireAuth();

  if (!user || user.role !== "admin") {
    return null;
  }

  return user;
}
