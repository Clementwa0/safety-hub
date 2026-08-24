import type { StaticImageData } from "next/image";

export const PRODUCT_CATEGORIES = [
  "Head Protection",
  "Eye Protection",
  "Ear Protection",
  "Body Protection",
  "Protective Clothing",
  "Hand Protection",
  "Foot Protection",
  "Respiratory Protection",
  "Safety Equipment",
] as const;

export type Category = (typeof PRODUCT_CATEGORIES)[number];

/** `out_of_stock` is a merchandising status (hidden from checkout even with stock);
 *  it is independent from the numeric `stock` count, which can also hit 0 under `active`. */
export const PRODUCT_STATUSES = ["active", "draft", "out_of_stock", "archived"] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  active: "Active",
  draft: "Draft",
  out_of_stock: "Out of Stock",
  archived: "Archived",
};

/** Images may be imported assets (public site) or remote URLs (admin created). */
export type ProductImage = string | StaticImageData;

export interface ProductSpec {
  label: string;
  value: string;
}

/**
 * A single purchasable option under a product (e.g. a size). When a product
 * has variants, the parent `price`/`stock`/`image` fields still exist for
 * backward compatibility (listing cards, legacy carts) but the variant-level
 * values are authoritative for anything that can differ per-size.
 */
export interface ProductVariant {
  sku: string;
  size: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  reserved: number;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  category: Category | string;
  subcategory: string;
  price: number;
  image: ProductImage;
  stock: number;
  description: string;
  status?: ProductStatus;
  featured?: boolean;
  specs: ProductSpec[];
  compareAtPrice?: number;
  images?: ProductImage[];
  rating?: number;
  reviews?: number;
  sku?: string;
  features?: string[];
  isNewArrival?: boolean;
  createdAt?: number;
  updatedAt?: number;
  popularity?: number;
  brand?: string;
  weight?: string;
  dimensions?: string;
  warranty?: string;
  certifications?: string[];
  /** Present only for variant products. Empty/undefined = simple product. */
  variants?: ProductVariant[];
}

/** Payload accepted by the admin create/update product forms. */
export interface ProductInput {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  brand?: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  status: ProductStatus;
  image: string;
  images?: string[];
  featured?: boolean;
  isNewArrival?: boolean;
  features?: string[];
  specs?: ProductSpec[];
  weight?: string;
  dimensions?: string;
  warranty?: string;
  certifications?: string[];
  variants?: ProductVariant[];
}

/** True when a product's stock/price/SKU are tracked per-variant rather than
 *  on the product record itself. Centralized here so callers never re-derive
 *  the "has real variants" check with a slightly different condition. */
export function hasVariants(product: Pick<Product, "variants">): boolean {
  return Array.isArray(product.variants) && product.variants.length > 0;
}

/** Returns the discount percentage (rounded, positive) when `compareAtPrice`
 *  is genuinely higher than `price`, otherwise `null`. */
export function getDiscountPercent(
  price: number,
  compareAtPrice?: number | null,
): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
