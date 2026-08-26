"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/PageHeader";
import { Loading } from "@/components/shared/Loading";
import { EmptyState } from "@/components/shared/EmptyState";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { formatDate, formatKES } from "@/lib/format";

import { adminStoreOrderService } from "@/services/sentinel/admin-store-order.service";

import { validateStatusTransition } from "@/modules/checkout/order-status";

import {
  STORE_PAYMENT_STATUSES,
  type StoreOrder,
  type StoreOrderStatus,
  type StorePaymentStatus,
} from "@/types/storefront/store-order";

import {
  StoreOrderStatusBadge,
  StorePaymentStatusBadge,
} from "@/features/storefront/checkout/components/StoreOrderStatusBadge";

import { cn } from "@/lib/utils";

const STATUS_ACTIONS: {
  label: string;
  target: StoreOrderStatus;
}[] = [
  { label: "Confirm", target: "confirmed" },
  { label: "Processing", target: "processing" },
  { label: "Ship", target: "shipped" },
  { label: "Deliver", target: "delivered" },
  { label: "Cancel", target: "cancelled" },
];

function titleCase(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AdminStoreOrderDetailPage() {
  const params = useParams<{ id: string }>();

  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!params.id) return;

    setLoading(true);
    setError(null);

    try {
      const result = await adminStoreOrderService.getById(params.id);
      setOrder(result);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not load order",
      );
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleStatusChange = async (
    target: StoreOrderStatus,
  ) => {
    if (!order) return;

    setUpdating(target);

    try {
      const updated =
        await adminStoreOrderService.updateStatus(
          order.id,
          target,
        );

      setOrder(updated);

      toast.success(
        `Order marked as ${titleCase(target)}`,
      );
    } catch (caught) {
      toast.error(
        caught instanceof Error
          ? caught.message
          : "Could not update status",
      );
    } finally {
      setUpdating(null);
    }
  };

  const handlePaymentChange = async (
    value: StorePaymentStatus,
  ) => {
    if (!order) return;

    setUpdating(`payment:${value}`);

    try {
      const updated =
        await adminStoreOrderService.updatePaymentStatus(
          order.id,
          value,
        );

      setOrder(updated);

      toast.success(
        `Payment marked as ${titleCase(value)}`,
      );
    } catch (caught) {
      toast.error(
        caught instanceof Error
          ? caught.message
          : "Could not update payment status",
      );
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <Loading
        label="Loading order..."
        className="py-24"
      />
    );
  }

  if (error || !order) {
    return (
      <EmptyState
        title="Order not found"
        description={
          error ?? "This order could not be loaded."
        }
        action={
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link href="/sentinel/store-orders" />
            }
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Store Orders
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={`Order #${order.orderNumber}`}
        description={`Placed on ${formatDate(
          new Date(order.createdAt),
        )}`}
        breadcrumbs={[
          {
            label: "Admin",
            href: "/sentinel/dashboard",
          },
          {
            label: "Store Orders",
            href: "/sentinel/store-orders",
          },
          {
            label: order.orderNumber,
          },
        ]}
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link href="/sentinel/store-orders" />
            }
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        }
      />

      {/* Main layout */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
        {/* Left column */}
        <div className="min-w-0 space-y-4 lg:space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-muted-foreground" />
                Order Items
              </CardTitle>
            </CardHeader>

            <CardContent>
              <ul className="divide-y divide-border">
                {order.items.map((item, index) => (
                  <li
                    key={`${
                      item.variantSku ??
                      item.product ??
                      item.name
                    }-${index}`}
                    className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug text-foreground">
                        {item.size
                          ? `${item.name} (${item.size})`
                          : item.name}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatKES(item.price)} ×{" "}
                        {item.quantity}
                        {item.variantSku
                          ? ` · SKU: ${item.variantSku}`
                          : item.sku
                            ? ` · SKU: ${item.sku}`
                            : ""}
                      </p>
                    </div>

                    <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                      {formatKES(item.subtotal)}
                    </span>
                  </li>
                ))}
              </ul>

              <Separator className="my-4" />

              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    Subtotal
                  </dt>
                  <dd className="font-medium">
                    {formatKES(order.subtotal)}
                  </dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    Shipping
                  </dt>
                  <dd className="font-medium">
                    {order.shippingFee === 0
                      ? "Free"
                      : formatKES(order.shippingFee)}
                  </dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    Tax
                  </dt>
                  <dd className="font-medium">
                    {formatKES(order.tax)}
                  </dd>
                </div>

                <Separator className="my-1" />

                <div className="flex justify-between text-base font-bold text-foreground">
                  <dt>Total</dt>
                  <dd className="tabular-nums">
                    {formatKES(order.total)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Customer + Shipping */}
          <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
            {/* Customer */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Customer
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2.5 text-sm">
                <p className="font-medium text-foreground">
                  {order.customer.name}
                </p>

                <a
                  href={`mailto:${order.customer.email}`}
                  className="flex min-w-0 items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />

                  <span className="truncate">
                    {order.customer.email}
                  </span>
                </a>

                <a
                  href={`tel:${order.customer.phone.replace(
                    /\s/g,
                    "",
                  )}`}
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {order.customer.phone}
                </a>
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Shipping Address
                </CardTitle>
              </CardHeader>

              <CardContent className="text-sm">
                <p className="text-foreground">
                  {order.shippingAddress.address}
                </p>

                <p className="mt-1 text-muted-foreground">
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.country}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right column */}
        <div className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:self-start lg:space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-4 w-4 text-muted-foreground" />
                Order Status
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Current
                </span>

                <StoreOrderStatusBadge
                  status={order.status}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
                {STATUS_ACTIONS.map((action) => {
                  const disabledReason =
                    validateStatusTransition(
                      order.status,
                      action.target,
                    );

                  const isUpdating =
                    updating === action.target;

                  const isCurrent =
                    order.status === action.target;

                  return (
                    <Button
                      key={action.target}
                      type="button"
                      size="sm"
                      variant={
                        action.target === "cancelled"
                          ? "destructive"
                          : "outline"
                      }
                      disabled={
                        isCurrent ||
                        disabledReason !== null ||
                        updating !== null
                      }
                      title={
                        disabledReason ?? undefined
                      }
                      onClick={() =>
                        void handleStatusChange(
                          action.target,
                        )
                      }
                      className={cn(
                        action.target === "cancelled" &&
                          "col-span-2 sm:col-span-3 lg:col-span-2",
                      )}
                    >
                      {isUpdating && (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      )}

                      {action.label}
                    </Button>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground">
                Orders move one step at a time. Only pending
                or confirmed orders can be cancelled.
              </p>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Payment
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Method
                </span>

                <span className="font-medium text-foreground">
                  {order.paymentMethod === "mpesa"
                    ? "M-Pesa"
                    : "Cash on Delivery"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="shrink-0 text-muted-foreground">
                  Status
                </span>

                <StorePaymentStatusBadge
                  status={order.paymentStatus}
                />
              </div>

              <Select
                value={order.paymentStatus}
                onValueChange={(value) => {
                  if (typeof value === "string") {
                    void handlePaymentChange(
                      value as StorePaymentStatus,
                    );
                  }
                }}
                disabled={updating !== null}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {STORE_PAYMENT_STATUSES.map(
                    (option) => (
                      <SelectItem
                        key={option}
                        value={option}
                        className="capitalize"
                      >
                        {titleCase(option)}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}