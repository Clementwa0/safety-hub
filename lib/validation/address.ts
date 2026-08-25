import { z } from "zod";

/**
 * Flat address form schema for React Hook Form (`zodResolver`).
 *
 * Mirrors `createAddressSchema` in `modules/cart/validation.ts, modules/checkout/validation.ts, and modules/customers/validation.ts`, which
 * remains the real source of truth server-side (both the add and edit API
 * routes validate against it / its partial `updateAddressSchema`).
 */
export const addressFormSchema = z.object({
  label: z.string().trim().max(60, "Keep the label under 60 characters").optional(),
  fullName: z.string().trim().min(1, "Full name is required"),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
  address: z.string().trim().min(3, "Address is required"),
  city: z.string().trim().min(2, "City is required"),
  country: z.string().trim().min(2, "Country is required"),
  isDefault: z.boolean().optional(),
});

export type AddressFormValues = z.infer<typeof addressFormSchema>;

export const EMPTY_ADDRESS_FORM: AddressFormValues = {
  label: "",
  fullName: "",
  phone: "",
  address: "",
  city: "",
  country: "Kenya",
  isDefault: false,
};
