import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { CustomerModel } from "@/lib/models/Customer";
import { requireAdmin } from "@/lib/auth";

const customerSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().optional().default(""),
  company: z.string().trim().optional().default(""),
  address: z.string().trim().optional().default(""),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    await connectToDatabase();
    const customer = await CustomerModel.findById(id).lean();

    if (!customer) {
      return apiError("Customer not found", [], 404);
    }

    return apiSuccess(serializeDoc(customer), "Customer loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load customer", [], 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = customerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();
    const customer = await CustomerModel.findById(id);

    if (!customer) {
      return apiError("Customer not found", [], 404);
    }

    Object.assign(customer, parsed.data);
    await customer.save();

    return apiSuccess(serializeDoc(customer.toObject()), "Customer updated");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update customer", [], 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    await connectToDatabase();
    const customer = await CustomerModel.findByIdAndDelete(id);

    if (!customer) {
      return apiError("Customer not found", [], 404);
    }

    return apiSuccess(null, "Customer deleted");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete customer", [], 500);
  }
}
