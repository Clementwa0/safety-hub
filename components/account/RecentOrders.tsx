import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";
import { formatDate, formatKES } from "@/lib/format";
import type { AccountOverviewOrder } from "@/types/account";

interface RecentOrdersProps {
  orders: AccountOverviewOrder[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="Browse the store and your orders will appear here."
        action={
          <Link href="/shop">
            <Button className="rounded-xl px-5 py-2.5">Browse Products</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Recent Orders</h2>
          <p className="text-sm text-muted-foreground">Your 3 most recent orders.</p>
        </div>
        <Link href="/account/orders" className="text-sm font-semibold text-primary hover:underline">
          View all
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {orders.map((order) => (
          <Card
            key={order.id}
            className="rounded-2xl border border-border bg-white p-0 shadow-[var(--shadow-soft)] transition-shadow duration-200 hover:shadow-[var(--shadow-card)]"
          >
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(new Date(order.createdAt))}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-base font-semibold text-foreground">{formatKES(order.total)}</p>
              </div>
              <Link
                href={`/account/orders/${order.id}`}
                className="inline-flex w-full items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/5"
              >
                View details
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
