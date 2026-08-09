import { z } from "zod";

import type { CheckoutInput, StorePaymentMethod } from "@/types/storefront/store-order";

/**
 * Flat checkout form schema for React Hook Form (`zodResolver`).
 *
 * The API (`/api/checkout`) validates against the nested
 * `checkoutSchema` in `lib/storefront/validation.ts` — that's the real
 * source of truth server-side. This flat shape mirrors the same rules
 * for the on-page form, where every field is its own `<Input>`, plus a
 * couple of UI-only fields (`paymentMethod` as a superset including
 * "whatsapp", and `saveToProfile`) that never reach the order snapshot
 * as-is.
 *
 * `email` is included so it round-trips through the form for guests,
 * but for a signed-in customer the field is rendered disabled and the
 * server independently re-pins it to the authenticated session's email
 * regardless of what's submitted — see `/api/checkout`.
 */
export const checkoutFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
  address: z.string().trim().min(3, "Address is required"),
  city: z.string().trim().min(2, "City is required"),
  country: z.string().trim().min(2, "Country is required"),
  saveToProfile: z.boolean().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

/** Maps the flat form values to the nested shape `/api/checkout` expects. */
export function toCheckoutInput(
  values: CheckoutFormValues,
  paymentMethod: StorePaymentMethod,
): CheckoutInput {
  return {
    customer: { name: values.name, email: values.email, phone: values.phone },
    shippingAddress: { address: values.address, city: values.city, country: values.country },
    paymentMethod,
  };
}
