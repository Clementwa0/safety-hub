import { apiError, apiSuccess } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { auth } from "@/lib/customer-auth";
import { linkGuestOrdersToCustomer } from "@/lib/storefront/account-linking";

/**
 * Called from the client after sign-in (e.g. from the post-checkout "Save
 * this order" prompt, or the account menu) to backfill any guest orders
 * onto the now-authenticated account. Idempotent — running it again with
 * nothing new to link just returns `linkedCount: 0`.
 *
 * The email used for matching always comes from the server-verified
 * session, never from the request body — see `linkGuestOrdersToCustomer`
 * for why that's the authorization boundary that matters here.
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.email) {
      return apiError("Not signed in", [], 401);
    }

    await connectToDatabase();
    const result = await linkGuestOrdersToCustomer(session.user.id, session.user.email);

    return apiSuccess(result, "Orders linked");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to link orders", [], 500);
  }
}
