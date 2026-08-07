"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";

import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatKES } from "@/lib/format";
import { storeOrderService } from "@/services/store-order.service";
import type { StoreOrder } from "@/types/store-order";

export default function AccountOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id;
  const { status } = useSession();
  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (status !== "authenticated" || !orderId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    storeOrderService
      .getById(orderId)
      .then((result) => {
        if (!cancelled) setOrder(result);
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Could not load this order");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId, status]);

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6" aria-hidden>
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  

  return (
    <div className="space-y-6">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to orders
      </Link>

      {error || !order ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
          {error ?? "Order not found"}
        </div>
      ) : (
        <>
          <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
                Order #{order.orderNumber}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Placed {formatDate(new Date(order.createdAt))}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </header>

          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_2px_8px_rgba(15,45,82,0.05)]">
            <h2 className="border-b border-border px-5 py-4 text-sm font-semibold text-foreground">
              Items
            </h2>
            <ul className="divide-y divide-border">
              {order.items.map((item, index) => (
                <li
                  key={`${item.sku ?? item.name}-${index}`}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.quantity} × {formatKES(item.price)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-foreground tabular-nums">
                    {formatKES(item.subtotal)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 border-t border-border px-5 py-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">{formatKES(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <dt>Shipping</dt>
                <dd className="tabular-nums">{formatKES(order.shippingFee)}</dd>
              </div>
              <div className="flex justify-between text-base font-semibold text-foreground">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatKES(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_2px_8px_rgba(15,45,82,0.05)]">
              <h2 className="text-sm font-semibold text-foreground">Delivery address</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {order.shippingAddress.address}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.country}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_2px_8px_rgba(15,45,82,0.05)]">
              <h2 className="text-sm font-semibold text-foreground">Payment</h2>
              <p className="mt-2 text-sm capitalize text-muted-foreground">
                {order.paymentMethod} — {order.paymentStatus}
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
