import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { resolveCartIdentity, persistCartIdentity } from "@/lib/storefront/session";
import { resolveStorefrontCustomer } from "@/lib/storefront/identity";
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

    // For a signed-in storefront customer, the email stored on the order
    // snapshot is always the authenticated account's email — never
    // whatever the (disabled, but not un-spoofable) client-side field
    // happened to submit. Guests are unaffected: they have no session
    // email to pin to, so their typed email passes through unchanged.
    const signedInCustomer = await resolveStorefrontCustomer();
    const checkoutInput = signedInCustomer?.email
      ? { ...parsed.data, customer: { ...parsed.data.customer, email: signedInCustomer.email } }
      : parsed.data;

    const order = await performCheckout(identity, checkoutInput);

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
