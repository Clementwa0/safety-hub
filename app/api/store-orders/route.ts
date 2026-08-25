import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeStoreOrderForCustomer } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { StoreOrderModel } from "@/lib/models/StoreOrder";
import { resolveStorefrontCustomer } from "@/lib/auth/identity";
import { customerOrderFilter } from "@/lib/db/ownership";
import { resolveCartIdentity, persistCartIdentity } from "@/modules/cart/session";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const customer = await resolveStorefrontCustomer();

    if (customer) {
      const orders = await StoreOrderModel.find(customerOrderFilter(customer.id))
        .sort("-createdAt")
        .lean();

      return apiSuccess(orders.map((order) => serializeStoreOrderForCustomer(order)), "Orders loaded");
    }

    const identity = await resolveCartIdentity(request);
    const filter = identity.userId
      ? { user: identity.userId }
      : { sessionId: identity.sessionId };

    const orders = await StoreOrderModel.find(filter).sort("-createdAt").lean();

    const response = apiSuccess(orders.map((order) => serializeStoreOrderForCustomer(order)), "Orders loaded");
    persistCartIdentity(response, identity);
    return response;
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load orders", [], 500);
  }
}
