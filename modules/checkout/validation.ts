import { z } from "zod";

export const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2, "Name is required"),
    email: z.string().trim().email("Enter a valid email"),
    phone: z.string().trim().min(7, "Enter a valid phone number"),
  }),
  shippingAddress: z.object({
    address: z.string().trim().min(3, "Address is required"),
    city: z.string().trim().min(2, "City is required"),
    country: z.string().trim().min(2, "Country is required"),
  }),
  paymentMethod: z.enum(["mpesa", "cod"], {
    message: "Select a payment method",
  }),
});

export const updateStoreOrderSchema = z
  .object({
    status: z
      .enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"])
      .optional(),
    paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  })
  .refine((data) => data.status !== undefined || data.paymentStatus !== undefined, {
    message: "Provide status and/or paymentStatus",
  });
