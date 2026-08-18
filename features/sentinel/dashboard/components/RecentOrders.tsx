import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RecentOrderRow } from "../computeDashboardData";
import { formatCurrency } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-muted text-muted-foreground",
  processing: "bg-info/10 text-info",
  shipped: "bg-warning/10 text-warning",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function RecentOrders({
  data,
  loading = false,
}: {
  data: RecentOrderRow[];
  loading?: boolean;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-1">
        <CardTitle className="text-sm font-medium text-foreground">Recent Orders</CardTitle>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs"
        >
          <Link href="/sentinel/store-orders">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        {loading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-full animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[160px] items-center justify-center text-sm text-muted-foreground">
            No orders yet
          </div>
        ) : (
          <div className="space-y-1">
            {data.slice(0, 5).map((order, index) => (
              <Link
                key={order.id}
                href={`/sentinel/store-orders/${order.id}`}
                title={`Order #${order.orderNumber} - ${order.customerName}`}
                className="group flex items-center gap-3 rounded-lg px-1.5 py-2 text-sm transition-colors hover:bg-accent/60"
              >
                <span className="w-4 shrink-0 text-[10px] font-medium text-muted-foreground">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-foreground group-hover:text-primary transition-colors">
                    {order.orderNumber}
                  </span>
                  <span className="block truncate text-[10px] text-muted-foreground">
                    {order.customerName}
                  </span>
                </span>
                <span className="shrink-0 text-right text-xs font-semibold text-foreground">
                  {formatCurrency(order.total)}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    STATUS_STYLES[order.status] ?? STATUS_STYLES.pending,
                  )}
                >
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}