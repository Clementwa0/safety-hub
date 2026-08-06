import type { StoreOrderStatus, StorePaymentStatus } from "./store-order";

export interface AccountMe {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  phone: string | null;
}

export interface AccountProfileUpdate {
  phone: string;
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
