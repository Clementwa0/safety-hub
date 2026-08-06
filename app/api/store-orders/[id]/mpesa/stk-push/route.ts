import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { resolveCartIdentity, persistCartIdentity } from "@/lib/storefront/session";
import { triggerMpesaStkPush, OrderAccessError } from "@/lib/storefront/mpesa-payment";
import { MpesaError } from "@/lib/mpesa";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Sends the M-Pesa STK push for an order the customer just placed (or
 * re-sends it, if the previous attempt failed or was cancelled on their
 * phone). The customer must own the order.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const identity = await resolveCartIdentity(request);
    const order = await triggerMpesaStkPush(id, identity);

    const response = apiSuccess(serializeDoc(order.toObject()), "M-Pesa payment prompt sent");
    persistCartIdentity(response, identity);
    return response;
  } catch (error) {
    if (error instanceof OrderAccessError) {
      return apiError(error.message, [], error.status);
    }
    if (error instanceof MpesaError) {
      return apiError(error.message, [], error.status);
    }
    return apiError(error instanceof Error ? error.message : "Failed to start M-Pesa payment", [], 500);
  }
}
