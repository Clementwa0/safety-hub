import type { Product } from "@/types/product";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=70";

/**
 * Normalizes a raw product document (from the API, or a `.lean()` Mongoose
 * read) into a complete `Product`, filling in sane defaults for any
 * missing/malformed field. Used on both the server (modules/catalog/catalog.ts,
 * building storefront pages directly from the DB) and the client
 * (services/shared/product.service.ts, normalizing whatever the API
 * returns) so a product looks the same wherever it's rendered from.
 */
export function normalizeProduct(product: Product & { _id?: string; [key: string]: unknown }): Product {
  const id = typeof product.id === "string" && product.id ? product.id : product._id ?? "";
  const category = typeof product.category === "string" && product.category ? product.category : "Safety Equipment";
  const subcategory = typeof product.subcategory === "string" && product.subcategory ? product.subcategory : category;
  const image = typeof product.image === "string" && product.image ? product.image : FALLBACK_IMAGE;

  return {
    ...product,
    id,
    name: typeof product.name === "string" && product.name ? product.name : "Unnamed product",
    description:
      typeof product.description === "string" && product.description
        ? product.description
        : "Certified safety equipment for demanding workplaces.",
    category,
    subcategory,
    price: typeof product.price === "number" ? product.price : Number(product.price ?? 0),
    compareAtPrice:
      typeof product.compareAtPrice === "number" && product.compareAtPrice > 0
        ? product.compareAtPrice
        : undefined,
    stock: typeof product.stock === "number" ? product.stock : Number(product.stock ?? 0),
    reserved: typeof product.reserved === "number" ? product.reserved : Number(product.reserved ?? 0),
    image,
    images: Array.isArray(product.images) ? (product.images as Product["images"]) : [],
    status: (product.status as Product["status"]) ?? "active",
    featured: Boolean(product.featured),
    isNewArrival: Boolean(product.isNewArrival),
    specs: Array.isArray(product.specs) ? (product.specs as Product["specs"]) : [],
    features: Array.isArray(product.features) ? (product.features as Product["features"]) : [],
    certifications: Array.isArray(product.certifications) ? (product.certifications as Product["certifications"]) : [],
    sku: typeof product.sku === "string" && product.sku ? product.sku : id,
    brand: typeof product.brand === "string" ? product.brand : "",
  };
}
