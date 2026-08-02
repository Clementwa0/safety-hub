import { getAuthenticatedUser, signToken, setAuthCookie } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";

export async function POST() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const token = signToken({ sub: user._id.toString(), role: user.role });
    const response = apiSuccess({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
    }, "Token refreshed");
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Refresh failed", [], 500);
  }
}
