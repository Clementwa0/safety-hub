import { apiError, apiSuccess } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { resolveStorefrontCustomer } from "@/lib/storefront/identity";
import { linkGuestOrdersToCustomer } from "@/lib/storefront/account-linking";

export async function POST() {
  try {
    const customer = await resolveStorefrontCustomer();

    if (!customer || !customer.email) {
      return apiError("Not signed in", [], 401);
    }

    await connectToDatabase();
    const result = await linkGuestOrdersToCustomer(customer.id, customer.email);

    return apiSuccess(result, "Orders linked");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to link orders", [], 500);
  }
}
