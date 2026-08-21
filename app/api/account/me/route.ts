import { apiError, apiSuccess } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { resolveStorefrontCustomer } from "@/lib/storefront/identity";
import { updateProfileSchema } from "@/lib/storefront/validation";
import { UserModel as StorefrontCustomerModel } from "@/lib/models/User";
import { AddressModel } from "@/lib/models/Address";

export async function GET() {
  try {
    const customer = await resolveStorefrontCustomer();

    if (!customer) {
      return apiError("Not signed in", [], 401);
    }

    await connectToDatabase();

    // `resolveStorefrontCustomer()` only carries what Auth.js puts on the
    // session (id/email/name/image) — phone and the saved default address
    // live outside the session and are read from the database here.
    const [record, defaultAddress] = await Promise.all([
      StorefrontCustomerModel.findById(customer.id).select("phone").lean(),
      AddressModel.findOne({ customer: customer.id }).sort("-isDefault -createdAt").lean(),
    ]);

    return apiSuccess(
      {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        image: customer.image,
        phone: record?.phone ?? null,
        address: defaultAddress
          ? {
              address: defaultAddress.address,
              city: defaultAddress.city,
              country: defaultAddress.country,
            }
          : null,
      },
      "Authenticated",
    );
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to load account", [], 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const customer = await resolveStorefrontCustomer();

    if (!customer) {
      return apiError("Not signed in", [], 401);
    }

    const body = await request.json().catch(() => null);
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();

    const { name, phone, address, city, country } = parsed.data;

    // Whitelisted update — only `name` and `phone` ever touch the
    // StorefrontCustomer document. Email, the Auth.js-managed identifiers,
    // and the customer id are never accepted from the request body (the
    // schema doesn't even define them), and `customer.id` here comes from
    // the authenticated session, never from the client.
    if (name !== undefined || phone !== undefined) {
      await StorefrontCustomerModel.updateOne(
        { _id: customer.id },
        { $set: { ...(name !== undefined ? { name } : {}), ...(phone !== undefined ? { phone } : {}) } },
      );
    }

    // Shipping address fields, if provided, are saved as the customer's
    // default saved address rather than on the profile document itself —
    // this reuses the same address book `/account/addresses` already
    // maintains, so there's a single source of truth for saved addresses.
    let savedAddress: { address: string; city: string; country: string } | null = null;

    if (address !== undefined && city !== undefined && country !== undefined) {
      await AddressModel.updateMany({ customer: customer.id }, { $set: { isDefault: false } });

      const upserted = await AddressModel.findOneAndUpdate(
        { customer: customer.id, isDefault: true },
        {
          $set: {
            fullName: name ?? customer.name ?? "",
            phone: phone ?? "",
            address,
            city,
            country,
            isDefault: true,
            customer: customer.id,
          },
        },
        {
  upsert: true,
  returnDocument: "after",
  setDefaultsOnInsert: true,
},
      ).lean();

      savedAddress = { address: upserted.address, city: upserted.city, country: upserted.country };
    }

    const updated = await StorefrontCustomerModel.findById(customer.id).select("name phone").lean();

    return apiSuccess(
      {
        id: customer.id,
        name: updated?.name ?? customer.name,
        email: customer.email,
        image: customer.image,
        phone: updated?.phone ?? null,
        address: savedAddress,
      },
      "Profile updated",
    );
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to update profile", [], 500);
  }
}
