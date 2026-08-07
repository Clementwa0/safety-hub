import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().trim().min(1, "productId is required"),
  quantity: z.number().int("Quantity must be a whole number").positive("Quantity must be greater than zero"),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int("Quantity must be a whole number").positive("Quantity must be greater than zero"),
});

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

export const createAddressSchema = z.object({
  label: z.string().trim().max(60).optional(),
  fullName: z.string().trim().min(1, "Full name is required"),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
  address: z.string().trim().min(3, "Address is required"),
  city: z.string().trim().min(2, "City is required"),
  country: z.string().trim().min(2, "Country is required"),
  isDefault: z.boolean().optional(),
});
