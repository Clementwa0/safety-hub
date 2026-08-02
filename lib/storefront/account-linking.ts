import mongoose from "mongoose";
import { cookies } from "next/headers";
import { StoreOrderModel } from "@/lib/models/StoreOrder";
import { CART_SESSION_COOKIE } from "@/lib/storefront/constants";

export interface LinkGuestOrdersResult {
  linkedCount: number;
}

/**
 * Links existing guest `StoreOrder` documents to a now-authenticated
 * customer account.
 *
 * Match criteria (either is sufficient, per the product spec):
 *  - `sessionId` equals the current browser's guest cart cookie, OR
 *  - `customer.email` equals the account's own verified email.
 *
 * Both sides of that OR are safe as an authorization boundary:
 *  - The guest session cookie is httpOnly and only ever read server-side,
 *    so "matches the caller's own cookie" already means "this is the
 *    caller's own browsing history" — nobody can supply someone else's
 *    session id.
 *  - `accountEmail` here is never taken from client input — every caller
 *    of this function passes the email from the server-verified Auth.js
 *    session (`session.user.email`), which only becomes true after Google
 *    OAuth or a clicked magic link proved ownership of that address. A
 *    shopper can never "link by guessing" someone else's email because
 *    the email side of this function is not attacker-controlled input.
 *
 * Only orders that aren't already linked to *some* account are touched
 * (`user: { $exists: false }`) — this can never steal an order that
 * already belongs to a different customer.
 *
 * Runs inside a transaction because it can touch multiple documents and we
 * want it to be all-or-nothing.
 */
export async function linkGuestOrdersToCustomer(
  customerId: string,
  accountEmail: string,
): Promise<LinkGuestOrdersResult> {
  const normalizedEmail = accountEmail.trim().toLowerCase();

  let sessionId: string | undefined;
  try {
    const cookieStore = await cookies();
    sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;
  } catch {
    // `cookies()` throws if called outside a request context. Fall back to
    // email-only matching in that case rather than failing entirely.
    sessionId = undefined;
  }

  const orConditions: Record<string, unknown>[] = [{ "customer.email": normalizedEmail }];
  if (sessionId) {
    orConditions.push({ sessionId });
  }

  const filter = {
    user: { $exists: false },
    $or: orConditions,
  };

  const session = await mongoose.startSession();
  let linkedCount = 0;

  try {
    await session.withTransaction(async () => {
      const result = await StoreOrderModel.updateMany(
        filter,
        {
          $set: {
            user: new mongoose.Types.ObjectId(customerId),
            userModel: "StorefrontCustomer",
          },
        },
        { session },
      );
      linkedCount = result.modifiedCount;
    });
  } finally {
    await session.endSession();
  }

  return { linkedCount };
}
