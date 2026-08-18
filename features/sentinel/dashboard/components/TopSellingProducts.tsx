import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TopProductRow } from "../computeDashboardData";
import { formatCurrency } from "@/lib/format";

export default function TopSellingProducts({
  data,
  loading = false,
}: {
  data: TopProductRow[];
  loading?: boolean;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-1">
        <CardTitle className="text-sm font-medium text-foreground">Top Products</CardTitle>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs"
        >
          <Link href="/sentinel/products">View all</Link>
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
            No sales recorded
          </div>
        ) : (
          <div className="space-y-1">
            {data.map((product, index) => (
              <Link
                key={product.key}
                href={`/sentinel/products/${product.id}`}
                title={`${product.name} • ${product.quantity} sold • ${formatCurrency(product.revenue)}`}
                className="group flex items-center gap-3 rounded-lg px-1.5 py-2 text-sm transition-colors hover:bg-accent/60"
              >
                <span className="w-4 shrink-0 text-[10px] font-medium text-muted-foreground">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-foreground group-hover:text-primary transition-colors">
                    {product.name}
                  </span>
                  <span className="block truncate text-[10px] text-muted-foreground">
                    {product.quantity} sold
                  </span>
                </span>
                <span className="shrink-0 text-right text-xs font-semibold text-foreground">
                  {formatCurrency(product.revenue)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}