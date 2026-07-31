import { getAuthenticatedUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    return apiSuccess({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
    }, "Authenticated");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to load user", [], 500);
  }
}
