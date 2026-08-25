import { apiRequest } from "@/lib/http";
import { normalizeProduct } from "@/modules/catalog/normalize";
import type { Product, ProductInput, ProductStatus } from "@/types/product";

export { normalizeProduct };

export interface ProductAvailability {
  productId: string;
  stock: number;
  reserved: number;
  available: number;
}

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

  /**
   * Accepts either plain product ids (existing callers, e.g. the inventory
   * report - no variant concept there) or `{ productId, variantSku }` pairs
   * (LineItemsEditor, once a size has been picked) so a single request can
   * mix simple products and specific variants. A pair with no `variantSku`
   * behaves exactly like passing the bare id: parent-level stock.
   */
  async getAvailability(
    productIds: Array<string | { productId: string; variantSku?: string | undefined }>,
  ): Promise<Map<string, ProductAvailability>> {
    const pairs = productIds
      .map((entry) => (typeof entry === "string" ? { productId: entry, variantSku: undefined } : entry))
      .filter((entry) => Boolean(entry.productId));

    const ids = Array.from(new Set(pairs.map((entry) => entry.productId)));
    const result = new Map<string, ProductAvailability>();
    if (ids.length === 0) return result;

    const params = new URLSearchParams();
    params.set("ids", ids.join(","));

    const variantPairs = pairs
      .filter((entry): entry is { productId: string; variantSku: string } => Boolean(entry.variantSku))
      .map((entry) => `${entry.productId}:${entry.variantSku}`);
    if (variantPairs.length > 0) {
      params.set("variants", variantPairs.join(","));
    }

    const payload = await apiRequest<{ items: ProductAvailability[] }>(
      `/api/products/availability?${params.toString()}`,
    );
    for (const entry of payload.items) {
      result.set(entry.productId, entry);
    }
    return result;
  },
};
