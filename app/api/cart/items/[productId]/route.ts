import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { resolveCartIdentity, persistCartIdentity } from "@/modules/cart/session";
import { updateCartItemQuantity, removeCartItem, serializeCart, CartError } from "@/modules/cart/cart";
import { updateCartItemSchema } from "@/modules/cart/validation";

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
    const cart = await updateCartItemQuantity(
      identity,
      productId,
      parsed.data.variantSku,
      parsed.data.quantity,
    );
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
    const variantSku = request.nextUrl.searchParams.get("variantSku") ?? undefined;

    await connectToDatabase();
    const identity = await resolveCartIdentity(request);
    const cart = await removeCartItem(identity, productId, variantSku);
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
