import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { resolveCartIdentity, persistCartIdentity } from "@/modules/cart/session";
import { getOrCreateCart, serializeCart, clearCart, CartError } from "@/modules/cart/cart";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const identity = await resolveCartIdentity(request);
    const cart = await getOrCreateCart(identity);
    const serialized = await serializeCart(cart);

    const response = apiSuccess(serialized, "Cart loaded");
    persistCartIdentity(response, identity);
    return response;
  } catch (error) {
    if (error instanceof CartError) {
      return apiError(error.message, [], error.status);
    }
    return apiError(error instanceof Error ? error.message : "Failed to load cart", [], 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const identity = await resolveCartIdentity(request);
    const cart = await clearCart(identity);
    const serialized = await serializeCart(cart);

    const response = apiSuccess(serialized, "Cart cleared");
    persistCartIdentity(response, identity);
    return response;
  } catch (error) {
    if (error instanceof CartError) {
      return apiError(error.message, [], error.status);
    }
    return apiError(error instanceof Error ? error.message : "Failed to clear cart", [], 500);
  }
}
