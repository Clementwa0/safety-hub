import mongoose from "mongoose";
import { cookies } from "next/headers";
import { StoreOrderModel } from "@/lib/models/StoreOrder";
import { CART_SESSION_COOKIE } from "@/lib/storefront/constants";

export interface LinkGuestOrdersResult {
  linkedCount: number;
}


 
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
