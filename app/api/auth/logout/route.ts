import { clearAuthCookie } from "@/lib/auth";
import { apiSuccess } from "@/lib/api";

export async function POST() {
  const response = apiSuccess(null, "Logged out successfully");
  clearAuthCookie(response);
  return response;
}
