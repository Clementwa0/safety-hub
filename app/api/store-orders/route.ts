import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { StoreOrderModel } from "@/lib/models/StoreOrder";
import { resolveCartIdentity, persistCartIdentity } from "@/lib/storefront/session";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const identity = await resolveCartIdentity(request);

    const filter = identity.userId ? { user: identity.userId } : { sessionId: identity.sessionId };
    const orders = await StoreOrderModel.find(filter).sort("-createdAt").lean();

    const response = apiSuccess(orders.map((order) => serializeDoc(order)), "Orders loaded");
    persistCartIdentity(response, identity);
    return response;
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load orders", [], 500);
  }
}
