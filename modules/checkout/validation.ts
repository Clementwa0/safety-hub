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
    // Optional payment-ledger details for a `paymentStatus: "paid"`
    // transition — see modules/payments/store-order-payment.service.ts.
    // When omitted, the route falls back to the order's own total/method
    // so existing callers that only ever sent `{ paymentStatus: "paid" }`
    // keep working, just now backed by a real ledger entry instead of a
    // bare status flip.
    paymentAmount: z.number().positive().optional(),
    paymentReference: z.string().trim().min(1).optional(),
    paymentNotes: z.string().trim().optional(),
    // Optional reason for a `paymentStatus: "refunded"` transition.
    refundReason: z.string().trim().optional(),
  })
  .refine((data) => data.status !== undefined || data.paymentStatus !== undefined, {
    message: "Provide status and/or paymentStatus",
  });
