import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { resolveCartIdentity, persistCartIdentity } from "@/lib/storefront/session";
import { updateCartItemQuantity, removeCartItem, serializeCart, CartError } from "@/lib/storefront/cart";
import { updateCartItemSchema } from "@/lib/storefront/validation";

interface RouteContext {
  params: Promise<{ productId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { productId } = await params;
    const body = await request.json().catch(() => null);
    const parsed = updateCartItemSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();
    const identity = await resolveCartIdentity(request);
    const cart = await updateCartItemQuantity(identity, productId, parsed.data.quantity);
    const serialized = await serializeCart(cart);

    const response = apiSuccess(serialized, "Cart updated");
    persistCartIdentity(response, identity);
    return response;
  } catch (error) {
    if (error instanceof CartError) {
      return apiError(error.message, [], error.status);
    }
    return apiError(error instanceof Error ? error.message : "Failed to update cart", [], 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { productId } = await params;

    await connectToDatabase();
    const identity = await resolveCartIdentity(request);
    const cart = await removeCartItem(identity, productId);
    const serialized = await serializeCart(cart);

    const response = apiSuccess(serialized, "Item removed from cart");
    persistCartIdentity(response, identity);
    return response;
  } catch (error) {
    if (error instanceof CartError) {
      return apiError(error.message, [], error.status);
    }
    return apiError(error instanceof Error ? error.message : "Failed to remove item", [], 500);
  }
}
