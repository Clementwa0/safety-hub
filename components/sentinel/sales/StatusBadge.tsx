"use client";

import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types/sentinel/order";
import type { QuotationStatus } from "@/types/sentinel/quotation";
import type { InvoiceStatus } from "@/types/sentinel/invoice";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

const ORDER_VARIANT: Record<OrderStatus, BadgeVariant> = {
  pending: "secondary",
  confirmed: "default",
  processing: "default",
  shipped: "default",
  delivered: "outline",
  cancelled: "destructive",
};

const QUOTATION_VARIANT: Record<QuotationStatus, BadgeVariant> = {
  draft: "secondary",
  sent: "default",
  accepted: "default",
  rejected: "destructive",
  expired: "outline",
};

const INVOICE_VARIANT: Record<InvoiceStatus, BadgeVariant> = {
  draft: "secondary",
  unpaid: "secondary",
  partially_paid: "default",
  paid: "default",
  overdue: "destructive",
  cancelled: "outline",
};

function label(value: string): string {
  return value.replace(/_/g, " ");
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={ORDER_VARIANT[status]} className="capitalize">
      {label(status)}
    </Badge>
  );
}

export function QuotationStatusBadge({ status }: { status: QuotationStatus }) {
  return (
    <Badge variant={QUOTATION_VARIANT[status]} className="capitalize">
      {label(status)}
    </Badge>
  );
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge variant={INVOICE_VARIANT[status]} className="capitalize">
      {label(status)}
    </Badge>
  );
}
