import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";
import { UserModel } from "@/lib/models/User";
import { apiError, apiSuccess } from "@/lib/api";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        "Validation failed",
        parsed.error.issues.map((issue) => issue.message),
        400,
      );
    }

    const { name, email, password } = parsed.data;

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase();

    const existingUser = await UserModel.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return apiError("A user with this email already exists.", [], 409);
    }

    // Only the very first registered user becomes an admin.
    // Every subsequent user is automatically assigned the staff role.
    const userCount = await UserModel.countDocuments();

    const role = userCount === 0 ? "admin" : "staff";

    const hashedPassword = await hashPassword(password);

    const user = await UserModel.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    const token = signToken({
      sub: user._id.toString(),
      role: user.role,
    });

    const response = apiSuccess(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      "Account created successfully.",
    );

    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error("Registration Error:", error);

    return apiError(
      "Something went wrong while creating your account.",
      [],
      500,
    );
  }
}
