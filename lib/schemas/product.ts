import { z } from "zod";

import { PRODUCT_STATUSES } from "@/types/product";
import { validateImageUrlFormat } from "@/lib/image-url";

const httpsImageUrl = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine((value) => validateImageUrlFormat(value).valid, {
      message: "Enter a valid public HTTPS image URL.",
    });

/**
 * Single source of truth for product validation. Shared by the admin
 * ProductForm (via @hookform/resolvers/zod) and the /api/products route
 * handlers, so client and server never drift out of sync.
 */
export const productSpecSchema = z.object({
  label: z.string().trim().min(1, "Required"),
  value: z.string().trim().min(1, "Required"),
});

export const productSchema = z
  .object({
    name: z.string().trim().min(3, "Name must be at least 3 characters."),
    description: z.string().trim().min(10, "Description must be at least 10 characters."),
    category: z.string().trim().min(1, "Select a category."),
    subcategory: z.string().trim().optional(),
    brand: z.string().trim().optional(),
    sku: z.string().trim().optional(),

    price: z.coerce.number().gt(0, "Selling price must be greater than 0."),
    compareAtPrice: z
      .union([z.literal(""), z.undefined(), z.nan(), z.coerce.number()])
      .transform((value) => (typeof value === "number" && !Number.isNaN(value) ? value : undefined))
      .optional(),

    stock: z.coerce
      .number()
      .int("Stock must be a whole number.")
      .nonnegative("Stock cannot be negative."),
    status: z.enum(PRODUCT_STATUSES),

    image: httpsImageUrl("A main product image URL is required."),
    // Blank rows (e.g. an "add image" row the admin hasn't filled in yet) are
    // dropped before validation so they don't block submission; anything
    // left must be a well-formed HTTPS image URL.
    images: z.preprocess(
      (val) => (Array.isArray(val) ? val.filter((v) => typeof v === "string" && v.trim().length > 0) : val),
      z.array(httpsImageUrl("Enter a valid image URL or remove this row.")).optional(),
    ),

    featured: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),

    features: z.array(z.string().trim().min(1)).optional(),
    specs: z.array(productSpecSchema).optional(),

    weight: z.string().trim().optional(),
    dimensions: z.string().trim().optional(),
    warranty: z.string().trim().optional(),
    certifications: z.array(z.string().trim().min(1)).optional(),
  })
  .refine(
    (data) => data.compareAtPrice === undefined || data.compareAtPrice > data.price,
    {
      message: "Original price must be greater than the selling price.",
      path: ["compareAtPrice"],
    },
  );

/** Raw shape RHF's `register`/`control` operate on, before parsing. */
export type ProductFormInput = z.input<typeof productSchema>;
/** Fully-defaulted shape passed to `onSubmit` after the resolver parses successfully. */
export type ProductFormValues = z.output<typeof productSchema>;

/** Server-side variant used for PATCH: same rules, every field optional. */
export const productPartialSchema = z
  .object({
    name: z.string().trim().min(3).optional(),
    description: z.string().trim().min(10).optional(),
    category: z.string().trim().min(1).optional(),
    subcategory: z.string().trim().optional(),
    brand: z.string().trim().optional(),
    sku: z.string().trim().optional(),
    price: z.coerce.number().gt(0).optional(),
    compareAtPrice: z
      .union([z.literal(""), z.undefined(), z.null(), z.nan(), z.coerce.number()])
      .transform((value) => (typeof value === "number" && !Number.isNaN(value) ? value : undefined))
      .optional(),
    stock: z.coerce.number().int().nonnegative().optional(),
    status: z.enum(PRODUCT_STATUSES).optional(),
    image: z
      .string()
      .trim()
      .refine((value) => value === "" || validateImageUrlFormat(value).valid, {
        message: "Enter a valid public HTTPS image URL.",
      })
      .optional(),
    images: z.preprocess(
      (val) => (Array.isArray(val) ? val.filter((v) => typeof v === "string" && v.trim().length > 0) : val),
      z.array(httpsImageUrl("Enter a valid image URL or remove this row.")).optional(),
    ),
    featured: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),
    features: z.array(z.string().trim().min(1)).optional(),
    specs: z.array(productSpecSchema).optional(),
    weight: z.string().trim().optional(),
    dimensions: z.string().trim().optional(),
    warranty: z.string().trim().optional(),
    certifications: z.array(z.string().trim().min(1)).optional(),
  })
  .refine(
    (data) =>
      data.compareAtPrice === undefined ||
      data.price === undefined ||
      data.compareAtPrice > data.price,
    {
      message: "Original price must be greater than the selling price.",
      path: ["compareAtPrice"],
    },
  );

export const bulkProductActionSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Select at least one product."),
  action: z.enum([
    "delete",
    "set-status",
    "set-featured",
    "unset-featured",
    "set-new",
    "unset-new",
  ]),
  status: z.enum(PRODUCT_STATUSES).optional(),
});
