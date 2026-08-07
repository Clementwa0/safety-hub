import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { resolveCartIdentity, persistCartIdentity } from "@/lib/storefront/session";
import { getMpesaPaymentStatus, OrderAccessError } from "@/lib/storefront/mpesa-payment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const identity = await resolveCartIdentity(request);
    const order = await getMpesaPaymentStatus(id, identity);

    const response = apiSuccess(serializeDoc(order.toObject()), "Payment status");
    persistCartIdentity(response, identity);
    return response;
  } catch (error) {
    if (error instanceof OrderAccessError) {
      return apiError(error.message, [], error.status);
    }
    return apiError(error instanceof Error ? error.message : "Failed to check payment status", [], 500);
  }
}
