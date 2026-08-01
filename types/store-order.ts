export const STORE_ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type StoreOrderStatus = (typeof STORE_ORDER_STATUSES)[number];

export const STORE_PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

export type StorePaymentStatus = (typeof STORE_PAYMENT_STATUSES)[number];

export interface StoreOrderItem {
  product?: string;
  name: string;
  slug?: string;
  sku?: string;
  image?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface StoreOrder {
  id: string;
  orderNumber: string;
  user?: string;
  sessionId?: string;
  items: StoreOrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  status: StoreOrderStatus;
  paymentStatus: StorePaymentStatus;
  customer: { name: string; email: string; phone: string };
  shippingAddress: { address: string; city: string; country: string };
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutInput {
  customer: { name: string; email: string; phone: string };
  shippingAddress: { address: string; city: string; country: string };
}

export interface AdminStoreOrderQuery {
  page?: number;
  limit?: number;
  sort?: string;
  q?: string;
  status?: StoreOrderStatus | "all";
  paymentStatus?: StorePaymentStatus | "all";
}

export interface Paginated<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface StoreOrderStats {
  totalOrders: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
}
