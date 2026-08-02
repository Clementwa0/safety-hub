import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, getPaginationParams, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { CustomerModel } from "@/lib/models/Customer";
import { requireAdmin } from "@/lib/auth";

const customerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().optional().default(""),
  company: z.string().trim().optional().default(""),
  address: z.string().trim().optional().default(""),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, sort, query } = getPaginationParams(searchParams);
    await connectToDatabase();

    const filter = query
      ? {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
            { company: { $regex: query, $options: "i" } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      CustomerModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      CustomerModel.countDocuments(filter),
    ]);

    return apiSuccess({
      items: customers.map((customer) => serializeDoc(customer)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }, "Customers loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load customers", [], 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const body = await request.json();
    const parsed = customerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();
    const customer = await CustomerModel.create(parsed.data);
    return apiSuccess(serializeDoc(customer.toObject()), "Customer created");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create customer", [], 500);
  }
}
