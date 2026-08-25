import { CustomerModel, type ICustomer } from "@/lib/models/Customer";
import type { CustomerObjectDTO } from "@/lib/schemas/sales";
import type mongoose from "mongoose";

/**
 * Resolves inline customer details (as submitted by CustomerFields on the
 * Quotation/Invoice/Order forms, or entered at storefront checkout) to an
 * existing Customer record when one matches, creating a new one only as a
 * last resort.
 *
 * Without this, saving the same "John Doe / john@example.com" on three
 * separate quotations created three separate Customer documents - the
 * form has no "pick an existing customer" step, so every inline submit
 * used to go straight to `CustomerModel.create`. Storefront checkout
 * (see performCheckout in modules/checkout/checkout.ts) reuses the same
 * matching so a shopper who orders from the storefront shows up in the
 * Customers CRM list too, matched against the same B2B customer record
 * if they happen to share an email or phone.
 *
 * Match order: email (exact, case-insensitive - the schema already
 * lowercases stored emails) is the strongest signal, since it's the field
 * people are least likely to typo differently across submissions. Phone
 * is checked next for customers who left email blank. Company+name is
 * the last, weakest fallback, since names alone collide too easily.
 *
 * `session` is optional so existing (non-transactional) callers are
 * unaffected; checkout passes its transaction session so the customer
 * upsert commits or rolls back atomically with the rest of the order.
 */
export async function findOrCreateCustomer(
  input: CustomerObjectDTO,
  session?: mongoose.ClientSession,
): Promise<ICustomer> {
  const name = input.name.trim();
  const email = input.email?.trim().toLowerCase();
  const phone = input.phone?.trim();
  const company = input.company?.trim();

  if (email) {
    const existing = await CustomerModel.findOne({ email }).session(session ?? null);
    if (existing) return existing;
  }

  if (phone) {
    const existing = await CustomerModel.findOne({ phone }).session(session ?? null);
    if (existing) return existing;
  }

  if (company) {
    const existing = await CustomerModel.findOne({ company, name }).session(session ?? null);
    if (existing) return existing;
  }

  const [created] = await CustomerModel.create(
    [
      {
        name,
        email: input.email || undefined,
        phone: input.phone || undefined,
        company: input.company || undefined,
        address: input.address || undefined,
      },
    ],
    session ? { session } : undefined,
  );

  return created;
}
