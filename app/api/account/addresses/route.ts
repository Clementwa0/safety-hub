import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { resolveStorefrontCustomer } from "@/lib/auth/identity";
import { AddressModel } from "@/lib/models/Address";
import { createAddressSchema } from "@/modules/customers/validation";

export async function GET() {
  try {
    const customer = await resolveStorefrontCustomer();

    if (!customer) {
      return apiError("Not signed in", [], 401);
    }

    await connectToDatabase();

    const addresses = await AddressModel.find({ customer: customer.id })
      .sort("-isDefault -createdAt")
      .lean();

    return apiSuccess(addresses.map((address) => serializeDoc(address)), "Addresses loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load addresses", [], 500);
  }
}

export async function POST(request: Request) {
  try {
    const customer = await resolveStorefrontCustomer();

    if (!customer) {
      return apiError("Not signed in", [], 401);
    }

    const body = await request.json().catch(() => null);
    const parsed = createAddressSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();

    if (parsed.data.isDefault) {
      await AddressModel.updateMany({ customer: customer.id }, { $set: { isDefault: false } });
    }

    const address = await AddressModel.create({
      ...parsed.data,
      customer: customer.id,
    });

    return apiSuccess(serializeDoc(address.toObject()), "Address saved");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to save address", [], 500);
  }
}
