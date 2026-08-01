import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { StoreOrderModel } from "@/lib/models/StoreOrder";
import { resolveCartIdentity, persistCartIdentity } from "@/lib/storefront/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const order = mongoose.isValidObjectId(id)
      ? await StoreOrderModel.findById(id).lean()
      : await StoreOrderModel.findOne({ orderNumber: id }).lean();

    if (!order) {
      return apiError("Order not found", [], 404);
    }

    const identity = await resolveCartIdentity(request);

    // A customer must only ever see their own order — never another
    // customer's, even by guessing/incrementing the URL.
    const owns =
      (identity.userId && order.user && String(order.user) === identity.userId) ||
      (identity.sessionId && order.sessionId && order.sessionId === identity.sessionId);

    if (!owns) {
      return apiError("Order not found", [], 404);
    }

    const response = apiSuccess(serializeDoc(order), "Order loaded");
    persistCartIdentity(response, identity);
    return response;
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load order", [], 500);
  }
}
