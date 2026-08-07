import mongoose from "mongoose";
import { apiError, apiSuccess } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { resolveStorefrontCustomer } from "@/lib/storefront/identity";
import { AddressModel } from "@/lib/models/Address";

interface RouteContext {
  params: Promise<{ id: string }>;
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
