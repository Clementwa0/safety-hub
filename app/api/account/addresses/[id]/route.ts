import mongoose from "mongoose";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { resolveStorefrontCustomer } from "@/lib/auth/identity";
import { AddressModel } from "@/lib/models/Address";
import { updateAddressSchema } from "@/modules/customers/validation";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const customer = await resolveStorefrontCustomer();

    if (!customer) {
      return apiError("Not signed in", [], 401);
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return apiError("Address not found", [], 404);
    }

    const body = await request.json().catch(() => null);
    const parsed = updateAddressSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();

    // Every write here is scoped to `{ _id: id, customer: customer.id }` -
    // the id in the URL alone is never enough to touch a row; it must also
    // belong to the signed-in customer resolved from the session.
    if (parsed.data.isDefault) {
      await AddressModel.updateMany({ customer: customer.id }, { $set: { isDefault: false } });
    }

    const updated = await AddressModel.findOneAndUpdate(
      { _id: id, customer: customer.id },
      { $set: parsed.data },
      { new: true },
    ).lean();

    if (!updated) {
      return apiError("Address not found", [], 404);
    }

    return apiSuccess(serializeDoc(updated), "Address updated");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update address", [], 500);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const customer = await resolveStorefrontCustomer();

    if (!customer) {
      return apiError("Not signed in", [], 401);
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return apiError("Address not found", [], 404);
    }

    await connectToDatabase();
    const deleted = await AddressModel.findOneAndDelete({
      _id: id,
      customer: customer.id,
    });

    if (!deleted) {
      return apiError("Address not found", [], 404);
    }

    return apiSuccess({ id }, "Address deleted");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete address", [], 500);
  }
}
