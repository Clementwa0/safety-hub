import mongoose from "mongoose";
import { apiError, apiSuccess } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { auth } from "@/lib/customer-auth";
import { AddressModel } from "@/lib/models/Address";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return apiError("Not signed in", [], 401);
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return apiError("Address not found", [], 404);
    }

    await connectToDatabase();

    // Scoped to `customer` so a customer can never delete someone else's
    // saved address, even by guessing/incrementing the id.
    const deleted = await AddressModel.findOneAndDelete({
      _id: id,
      customer: session.user.id,
    });

    if (!deleted) {
      return apiError("Address not found", [], 404);
    }

    return apiSuccess({ id }, "Address deleted");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete address", [], 500);
  }
}
