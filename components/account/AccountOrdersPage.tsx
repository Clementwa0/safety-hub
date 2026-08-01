"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaBoxOpen } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate, formatKES } from "@/lib/format";
import { storeOrderService } from "@/services/store-order.service";
import type { StoreOrder } from "@/types/store-order";
import { StoreOrderStatusBadge } from "@/components/checkout/StoreOrderStatusBadge";

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    storeOrderService
      .myOrders()
      .then((result) => {
        if (!cancelled) setOrders(result);
      })
      .catch((caught) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Could not load orders");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Orders placed from this browser. Keep this device/browser to track them later.
      </p>

      <div className="mt-6">
        {loading ? (
          <Loading label="Loading your orders..." className="py-16" />
        ) : error ? (
          <EmptyState
            title="Something went wrong"
            description={error}
            action={
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try again
              </Button>
            }
          />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Once you place an order, it will show up here."
            action={
              <Button nativeButton={false} render={<Link href="/shop" />}>
                Start Shopping
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-secondary/10 p-2.5 text-secondary">
                      <FaBoxOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">Placed: {formatDate(new Date(order.createdAt))}</p>
                      <p className="mt-1 text-sm font-medium text-secondary">{formatKES(order.total)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <StoreOrderStatusBadge status={order.status} />
                    <Button
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      render={<Link href={`/account/orders/${order.id}`} />}
                    >
                      View Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
