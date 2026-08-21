export const SENTINEL = {
  ROOT: "/sentinel",

  PRODUCTS: "/sentinel/products",
  PRODUCTS_NEW: "/sentinel/products/new",

  CATEGORIES: "/sentinel/categories",

  ORDERS: "/sentinel/orders",
  ORDERS_NEW: "/sentinel/orders/new",

  STORE_ORDERS: "/sentinel/store-orders",

  QUOTATIONS: "/sentinel/quotations",
  QUOTATIONS_NEW: "/sentinel/quotations/new",

  INVOICES: "/sentinel/invoices",
  INVOICES_NEW: "/sentinel/invoices/new",
} as const;

export const AUTH = {
  LOGIN: "/login",
  SENTINEL_ROOT: "/sentinel/dashboard",
} as const;

export function sentinelPath(...segments: string[]) {
  return ["/sentinel", ...segments].join("/");
}