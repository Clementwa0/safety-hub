import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { comparePassword, signToken, setAuthCookie } from "@/lib/auth";
import { UserModel } from "@/lib/models/User";
import { apiError, apiSuccess } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();
    const user = await UserModel.findOne({ email: parsed.data.email.toLowerCase() });

    if (!user) {
      return apiError("Invalid email or password", [], 401);
    }

    const validPassword = await comparePassword(parsed.data.password, user.password);

    if (!validPassword) {
      return apiError("Invalid email or password", [], 401);
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
    }, "Logged in successfully");
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Login failed", [], 500);
  }
}
