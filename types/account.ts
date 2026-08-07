import type { StoreOrderStatus, StorePaymentStatus } from "./store-order";

export interface AccountMe {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  phone: string | null;
  /** The customer's saved default address, if any — used to autofill checkout. */
  address: { address: string; city: string; country: string } | null;
}

export interface AccountProfileUpdate {
  /** Email is intentionally omitted — it's managed by the sign-in provider only. */
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface LinkGuestOrdersResult {
  linkedCount: number;
}

export interface AccountOverviewOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  paymentStatus: StorePaymentStatus;
  status: StoreOrderStatus;
}

export interface AccountOverview {
  orderCount: number;
  pendingOrders: number;
  completedOrders: number;
  addressCount: number;
  recentOrders: AccountOverviewOrder[];
}
