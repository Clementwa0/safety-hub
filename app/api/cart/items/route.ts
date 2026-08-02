import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { resolveCartIdentity, persistCartIdentity } from "@/lib/storefront/session";
import { addItemToCart, serializeCart, CartError } from "@/lib/storefront/cart";
import { addCartItemSchema } from "@/lib/storefront/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = addCartItemSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();
    const identity = await resolveCartIdentity(request);
    const cart = await addItemToCart(identity, parsed.data.productId, parsed.data.quantity);
    const serialized = await serializeCart(cart);

    const response = apiSuccess(serialized, "Item added to cart");
    persistCartIdentity(response, identity);
    return response;
  } catch (error) {
    if (error instanceof CartError) {
      return apiError(error.message, [], error.status);
    }
    return apiError(error instanceof Error ? error.message : "Failed to add item to cart", [], 500);
  }
}
