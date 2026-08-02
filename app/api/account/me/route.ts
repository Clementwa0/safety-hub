import { apiError, apiSuccess } from "@/lib/api";
import { auth } from "@/lib/customer-auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return apiError("Not signed in", [], 401);
    }

    return apiSuccess(
      {
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      },
      "Authenticated",
    );
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to load account", [], 500);
  }
}
