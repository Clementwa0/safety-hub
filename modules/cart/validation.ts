import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().trim().min(1, "productId is required"),
  variantSku: z.string().trim().min(1).optional(),
  quantity: z.number().int("Quantity must be a whole number").positive("Quantity must be greater than zero"),
});

export const updateCartItemSchema = z.object({
  variantSku: z.string().trim().min(1).optional(),
  quantity: z.number().int("Quantity must be a whole number").positive("Quantity must be greater than zero"),
});
