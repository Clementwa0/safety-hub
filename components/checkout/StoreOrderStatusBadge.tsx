"use client";

import { Badge } from "@/components/ui/badge";
import type { StoreOrderStatus, StorePaymentStatus } from "@/types/storefront/store-order";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

const STATUS_VARIANT: Record<StoreOrderStatus, BadgeVariant> = {
  pending: "secondary",
  confirmed: "default",
  processing: "default",
  shipped: "default",
  delivered: "outline",
  cancelled: "destructive",
};

const PAYMENT_VARIANT: Record<StorePaymentStatus, BadgeVariant> = {
  pending: "secondary",
  paid: "default",
  failed: "destructive",
  refunded: "outline",
};

export function StoreOrderStatusBadge({ status }: { status: StoreOrderStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className="capitalize">
      {status}
    </Badge>
  );
}

export function StorePaymentStatusBadge({ status }: { status: StorePaymentStatus }) {
  return (
    <Badge variant={PAYMENT_VARIANT[status]} className="capitalize">
      {status}
    </Badge>
  );
}
