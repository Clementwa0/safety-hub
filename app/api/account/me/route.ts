import { apiError, apiSuccess } from "@/lib/api";
import { resolveStorefrontCustomer } from "@/lib/storefront/identity";

export async function GET() {
  try {
    const customer = await resolveStorefrontCustomer();

    if (!customer) {
      return apiError("Not signed in", [], 401);
    }

    return apiSuccess(
      {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        image: customer.image,
      },
      "Authenticated",
    );
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to load account", [], 500);
  }
}
