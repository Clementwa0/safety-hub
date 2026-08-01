"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loading } from "@/components/shared/Loading";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate, formatKES } from "@/lib/format";
import { storeOrderService } from "@/services/store-order.service";
import type { StoreOrder } from "@/types/store-order";
import { StoreOrderStatusBadge, StorePaymentStatusBadge } from "@/components/checkout/StoreOrderStatusBadge";
import { OrderProgressTracker } from "@/components/checkout/OrderProgressTracker";

export default function AccountOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    storeOrderService
      .getById(params.id)
      .then((result) => {
        if (!cancelled) setOrder(result);
      })
      .catch((caught) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Could not load order");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return <Loading label="Loading order..." className="py-24" />;
  }

  if (error || !order) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16">
        <EmptyState
          title="We couldn't find that order"
          description={error ?? "It may not belong to this browser session."}
          action={
            <Button nativeButton={false} render={<Link href="/account/orders" />}>
              Back to My Orders
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
      >
        <FaArrowLeft className="h-4 w-4" />
        Back to My Orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order #{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">Placed on {formatDate(new Date(order.createdAt))}</p>
        </div>
        <div className="flex items-center gap-2">
          <StoreOrderStatusBadge status={order.status} />
          <StorePaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderProgressTracker status={order.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item, index) => (
                <div key={`${item.product ?? item.name}-${index}`} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatKES(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold">{formatKES(item.subtotal)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{order.customer.name}</p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.country}
              </p>
              <p className="pt-2">{order.customer.email}</p>
              <p>{order.customer.phone}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
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
                <span className="text-muted-foreground">VAT</span>
                <span className="font-medium">{formatKES(order.tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-secondary">{formatKES(order.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
