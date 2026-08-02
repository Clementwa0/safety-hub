import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { resolveCartIdentity, persistCartIdentity } from "@/lib/storefront/session";
import { performCheckout } from "@/lib/storefront/checkout";
import { checkoutSchema } from "@/lib/storefront/validation";
import { CartError } from "@/lib/storefront/cart";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();
    const identity = await resolveCartIdentity(request);
    const order = await performCheckout(identity, parsed.data);

    const response = apiSuccess(serializeDoc(order.toObject()), "Order placed");
    persistCartIdentity(response, identity);
    return response;
  } catch (error) {
    if (error instanceof CartError) {
      return apiError(error.message, [], error.status);
    }
    return apiError(error instanceof Error ? error.message : "Checkout failed", [], 500);
  }
}
