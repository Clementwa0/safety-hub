"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/PageHeader";
import { Loading } from "@/components/shared/Loading";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StoreOrderStatusBadge, StorePaymentStatusBadge } from "@/components/checkout/StoreOrderStatusBadge";
import { formatDate, formatKES } from "@/lib/format";
import { adminStoreOrderService } from "@/services/sentinel/admin-store-order.service";
import { validateStatusTransition } from "@/lib/storefront/order-status";
import {
  STORE_PAYMENT_STATUSES,
  type StoreOrder,
  type StoreOrderStatus,
  type StorePaymentStatus,
} from "@/types/storefront/store-order";

const STATUS_ACTIONS: { label: string; target: StoreOrderStatus }[] = [
  { label: "Confirm", target: "confirmed" },
  { label: "Processing", target: "processing" },
  { label: "Ship", target: "shipped" },
  { label: "Deliver", target: "delivered" },
  { label: "Cancel", target: "cancelled" },
];

export default function AdminStoreOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrder(await adminStoreOrderService.getById(params.id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load order");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleStatusChange = async (target: StoreOrderStatus) => {
    if (!order) return;
    setUpdating(target);
    try {
      const updated = await adminStoreOrderService.updateStatus(order.id, target);
      setOrder(updated);
      toast.success(`Order marked as ${target}`);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not update status");
    } finally {
      setUpdating(null);
    }
  };

  const handlePaymentChange = async (value: StorePaymentStatus) => {
    if (!order) return;
    setUpdating(`payment:${value}`);
    try {
      const updated = await adminStoreOrderService.updatePaymentStatus(order.id, value);
      setOrder(updated);
      toast.success(`Payment marked as ${value}`);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not update payment status");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <Loading label="Loading order..." className="py-24" />;
  }

  if (error || !order) {
    return (
      <EmptyState
        title="Order not found"
        description={error ?? "This order could not be loaded."}
        action={
          <Button variant="outline" nativeButton={false} render={<Link href="/sentinel/store-orders" />}>
            Back to Store Orders
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order #${order.orderNumber}`}
        description={`Placed on ${formatDate(new Date(order.createdAt))}`}
        breadcrumbs={[
          { label: "Admin", href: "/sentinel/dashboard" },
          { label: "Store Orders", href: "/sentinel/store-orders" },
          { label: order.orderNumber },
        ]}
        actions={
          <Button variant="outline" nativeButton={false} render={<Link href="/sentinel/store-orders" />}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium text-foreground">{order.customer.name}</p>
              <p className="text-muted-foreground">{order.customer.email}</p>
              <p className="text-muted-foreground">{order.customer.phone}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.country}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item, index) => (
                <div key={`${item.product ?? item.name}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatKES(item.price)} × {item.quantity}
                      {item.sku ? ` · SKU: ${item.sku}` : ""}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold">{formatKES(item.subtotal)}</p>
                </div>
              ))}

              <Separator />

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatKES(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {order.shippingFee === 0 ? "Free" : formatKES(order.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">{formatKES(order.tax)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-foreground">
                  <span>Total</span>
                  <span>{formatKES(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Method</span>
                <span className="text-sm font-medium capitalize text-foreground">
                  {order.paymentMethod === "mpesa" ? "M-Pesa" : "Cash on Delivery"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StorePaymentStatusBadge status={order.paymentStatus} />
              </div>
              <Select
                value={order.paymentStatus}
                onValueChange={(value) => {
                  if (typeof value === "string") void handlePaymentChange(value as StorePaymentStatus);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STORE_PAYMENT_STATUSES.map((option) => (
                    <SelectItem key={option} value={option}>
                      <span className="capitalize">{option}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StoreOrderStatusBadge status={order.status} />
              </div>

              <div className="flex flex-wrap gap-2">
                {STATUS_ACTIONS.map((action) => {
                  const disabledReason = validateStatusTransition(order.status, action.target);
                  const isCurrent = order.status === action.target;

                  return (
                    <Button
                      key={action.target}
                      type="button"
                      size="sm"
                      variant={action.target === "cancelled" ? "destructive" : "outline"}
                      disabled={isCurrent || Boolean(disabledReason) || updating === action.target}
                      title={disabledReason ?? undefined}
                      onClick={() => void handleStatusChange(action.target)}
                    >
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
