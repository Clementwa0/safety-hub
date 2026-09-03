import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  formatDashboardCurrency,
  type RecentOrderRow,
} from "../computeDashboardData";
import type { StoreOrderStatus } from "@/types/storefront/store-order";

const STATUS_LABEL: Record<StoreOrderStatus, string> = {
  pending: "Pending",
  confirmed: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Completed",
  cancelled: "Cancelled",
};

const STATUS_STYLES: Record<StoreOrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-violet-100 text-violet-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function RecentOrdersCard({
  orders,
  loading = false,
}: {
  orders: RecentOrderRow[];
  loading?: boolean;
}) {
  return (
    <Card className="flex h-full flex-col border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2 py-1.5 px-4">
        <CardTitle className="text-xs font-semibold text-foreground">
          Recent Orders
        </CardTitle>
        <Link
          href="/sentinel/store-orders"
          className="text-[11px] font-semibold text-primary hover:underline"
        >
          View all orders →
        </Link>
      </CardHeader>
      <CardContent className="flex-1 px-4 pb-3 pt-0">
        {loading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-full animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex h-[140px] items-center justify-center text-xs text-muted-foreground">
            No orders yet.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {orders.map((order) => (
              <li
                key={order.id}
                className="flex items-center gap-2 py-1.5 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/sentinel/store-orders/${order.id}`}
                    className="block truncate font-semibold text-foreground hover:text-primary hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {order.customerName}
                  </p>
                </div>

                <div className="shrink-0 text-[11px] text-muted-foreground">
                  {formatDistanceToNowStrict(new Date(order.createdAt), {
                    addSuffix: true,
                  })}
                </div>

                <div className="shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">
                  {formatDashboardCurrency(order.total)}
                </div>

                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 border-transparent px-1.5 py-0.5 text-[10px] font-medium",
                    STATUS_STYLES[order.status],
                  )}
                >
                  {STATUS_LABEL[order.status]}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}