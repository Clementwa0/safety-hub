import { CustomerModel, type ICustomer } from "@/lib/models/Customer";
import type { CustomerObjectDTO } from "@/lib/schemas/sales";

/**
 * Resolves inline customer details (as submitted by CustomerFields on the
 * Quotation/Invoice/Order forms) to an existing Customer record when one
 * matches, creating a new one only as a last resort.
 *
 * Without this, saving the same "John Doe / john@example.com" on three
 * separate quotations created three separate Customer documents - the
 * form has no "pick an existing customer" step, so every inline submit
 * used to go straight to `CustomerModel.create`.
 *
 * Match order: email (exact, case-insensitive - the schema already
 * lowercases stored emails) is the strongest signal, since it's the field
 * people are least likely to typo differently across submissions. Phone
 * is checked next for customers who left email blank. Company+name is
 * the last, weakest fallback, since names alone collide too easily.
 */
export async function findOrCreateCustomer(
  input: CustomerObjectDTO,
): Promise<ICustomer> {
  const name = input.name.trim();
  const email = input.email?.trim().toLowerCase();
  const phone = input.phone?.trim();
  const company = input.company?.trim();

  if (email) {
    const existing = await CustomerModel.findOne({ email });
    if (existing) return existing;
  }

  if (phone) {
    const existing = await CustomerModel.findOne({ phone });
    if (existing) return existing;
  }

  if (company) {
    const existing = await CustomerModel.findOne({ company, name });
    if (existing) return existing;
  }

  return CustomerModel.create({
    name,
    email: input.email || undefined,
    phone: input.phone || undefined,
    company: input.company || undefined,
    address: input.address || undefined,
  });
}
