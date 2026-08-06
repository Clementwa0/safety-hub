import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { auth } from "@/lib/customer-auth";
import { AddressModel } from "@/lib/models/Address";
import { createAddressSchema } from "@/lib/storefront/validation";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return apiError("Not signed in", [], 401);
    }

    await connectToDatabase();

    const addresses = await AddressModel.find({ customer: session.user.id })
      .sort("-isDefault -createdAt")
      .lean();

    return apiSuccess(addresses.map((address) => serializeDoc(address)), "Addresses loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load addresses", [], 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return apiError("Not signed in", [], 401);
    }

    const body = await request.json().catch(() => null);
    const parsed = createAddressSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();

    if (parsed.data.isDefault) {
      await AddressModel.updateMany({ customer: session.user.id }, { $set: { isDefault: false } });
    }

    const address = await AddressModel.create({
      ...parsed.data,
      customer: session.user.id,
    });

    return apiSuccess(serializeDoc(address.toObject()), "Address saved");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to save address", [], 500);
  }
}
