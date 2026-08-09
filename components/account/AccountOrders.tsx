"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatKES, formatDate } from "@/lib/format";
import { storeOrderService } from "@/services/storefront/store-order.service";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";
import type { StoreOrder } from "@/types/storefront/store-order";

export default function AccountOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    storeOrderService
      .myOrders()
      .then((result) => {
        if (!cancelled) setOrders(result);
      })
      .catch((caught) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Could not load your orders");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-40 animate-pulse rounded-xl bg-muted" />
        <div className="space-y-3">
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="rounded-2xl border border-border bg-white p-10 text-center shadow-[var(--shadow-soft)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Login required</p>
        <h1 className="mt-4 text-2xl font-semibold text-foreground sm:text-3xl">View your orders</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to see your order history and delivery status.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => signIn("google", { callbackUrl: "/account/orders" })} className="rounded-xl px-6 py-3">
            Sign in with Google
          </Button>
          <Link
            href="/account/sign-in"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            More sign-in options
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">A complete history of everything you&apos;ve ordered.</p>
      </div>

      <section className="rounded-2xl border border-border bg-white shadow-[var(--shadow-soft)]">
        {error ? (
          <div className="p-8 text-center text-sm text-destructive">{error}</div>
        ) : orders.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No orders yet"
              description="Browse the store and your orders will appear here."
              action={
                <Link href="/shop">
                  <Button className="rounded-xl px-5 py-2.5">Browse Products</Button>
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Order Number</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-6 py-4 font-medium text-foreground">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(new Date(order.createdAt))}</td>
                      <td className="px-6 py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 text-right font-semibold tabular-nums">{formatKES(order.total)}</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/5"
                        >
                          View Details <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-border md:hidden">
              {orders.map((order) => (
                <li key={order.id} className="space-y-3 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-foreground">{order.orderNumber}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                    <span>{formatDate(new Date(order.createdAt))}</span>
                    <span className="font-semibold tabular-nums text-foreground">{formatKES(order.total)}</span>
                  </div>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="inline-flex w-full items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/5"
                  >
                    View Details
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
