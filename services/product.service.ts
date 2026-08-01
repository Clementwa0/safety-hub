import { apiRequest } from "@/lib/http";
import type { Product, ProductInput, ProductStatus } from "@/types/product";

export interface ProductQuery {
  search?: string;
  category?: string;
  brand?: string;
  status?: string;
  featured?: boolean;
  isNewArrival?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export type BulkProductAction =
  | "delete"
  | "set-status"
  | "set-featured"
  | "unset-featured"
  | "set-new"
  | "unset-new";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=70";

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

function buildQueryParams(query: ProductQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.search) params.set("q", query.search);
  if (query.category && query.category !== "all") params.set("category", query.category);
  if (query.brand && query.brand !== "all") params.set("brand", query.brand);
  if (query.status && query.status !== "all") params.set("status", query.status);
  if (query.featured) params.set("featured", "true");
  if (query.isNewArrival) params.set("isNewArrival", "true");
  if (query.minPrice !== undefined) params.set("minPrice", String(query.minPrice));
  if (query.maxPrice !== undefined) params.set("maxPrice", String(query.maxPrice));
  return params;
}

export const productService = {
  async list(query: ProductQuery = {}): Promise<Product[]> {
    const params = buildQueryParams(query);
    if (!params.has("limit")) params.set("limit", "200");

    const payload = await apiRequest<{ items: Product[]; pagination: unknown }>(`/api/products${params.toString() ? `?${params.toString()}` : ""}`);
    return payload.items.map((product) => normalizeProduct(product as Product & { _id?: string; [key: string]: unknown }));
  },

  async getById(id: string): Promise<Product> {
    const product = await apiRequest<Product>(`/api/products/${id}`);
    return normalizeProduct(product as Product & { _id?: string; [key: string]: unknown });
  },

  async create(input: ProductInput): Promise<Product> {
    const product = await apiRequest<Product>("/api/products", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return normalizeProduct(product as Product & { _id?: string; [key: string]: unknown });
  },

  async update(id: string, input: Partial<ProductInput>): Promise<Product> {
    const product = await apiRequest<Product>(`/api/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return normalizeProduct(product as Product & { _id?: string; [key: string]: unknown });
  },

  async remove(id: string): Promise<void> {
    await apiRequest<void>(`/api/products/${id}`, { method: "DELETE" });
  },

  async duplicate(id: string): Promise<Product> {
    const product = await apiRequest<Product>(`/api/products/${id}/duplicate`, {
      method: "POST",
    });
    return normalizeProduct(product as Product & { _id?: string; [key: string]: unknown });
  },

  async bulkAction(ids: string[], action: BulkProductAction, status?: ProductStatus): Promise<void> {
    await apiRequest<{ updated?: number; deleted?: number }>("/api/products/bulk", {
      method: "POST",
      body: JSON.stringify({ ids, action, status }),
    });
  },

  /** Builds a CSV file for the given products and triggers a client-side download. */
  exportCsv(products: Product[], filename = "products-export.csv") {
    const headers = [
      "id",
      "name",
      "sku",
      "category",
      "subcategory",
      "brand",
      "price",
      "compareAtPrice",
      "stock",
      "status",
      "featured",
      "isNewArrival",
    ];

    const escape = (value: unknown) => {
      const text = value === undefined || value === null ? "" : String(value);
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };

    const rows = products.map((product) =>
      [
        product.id,
        product.name,
        product.sku ?? "",
        product.category,
        product.subcategory,
        product.brand ?? "",
        product.price,
        product.compareAtPrice ?? "",
        product.stock,
        product.status ?? "active",
        product.featured ? "yes" : "no",
        product.isNewArrival ? "yes" : "no",
      ]
        .map(escape)
        .join(","),
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
