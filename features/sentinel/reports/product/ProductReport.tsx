"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Package, PackageX, FileEdit, Archive } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import StatsCard from "@/components/sentinel/shared/StatsCard";
import { formatCurrency } from "@/lib/format";
import { productService } from "@/services/shared/product.service";
import { salesDashboardService } from "@/services/sentinel/sales-dashboard.service";
import type { Product } from "@/types/product";
import type { TopProduct } from "@/types/sentinel/sales-dashboard";

interface CategoryRow {
  category: string;
  count: number;
  catalogValue: number;
}

export default function ProductReport() {
  const [products, setProducts] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [productList, salesDashboard] = await Promise.all([
        productService.list(),
        salesDashboardService.get({ range: "90d" }),
      ]);

      setProducts(productList);
      setTopProducts(salesDashboard.topProducts);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not load the product report",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const active = products.filter(
      (p) => (p.status ?? "active") === "active",
    ).length;

    const draft = products.filter((p) => p.status === "draft").length;

    const outOfStock = products.filter(
      (p) => p.status === "out_of_stock" || p.stock <= 0,
    ).length;

    const archived = products.filter(
      (p) => p.status === "archived",
    ).length;

    return {
      total: products.length,
      active,
      draft,
      outOfStock,
      archived,
    };
  }, [products]);

  const byCategory = useMemo<CategoryRow[]>(() => {
    const map = new Map<string, CategoryRow>();

    for (const product of products) {
      if (product.status === "archived") continue;

      const key = String(product.category || "Uncategorized");

      const row = map.get(key) ?? {
        category: key,
        count: 0,
        catalogValue: 0,
      };

      row.count += 1;
      row.catalogValue += product.price * product.stock;

      map.set(key, row);
    }

    return Array.from(map.values()).sort(
      (a, b) => b.count - a.count,
    );
  }, [products]);

  if (error) {
    return (
      <EmptyState
        title="Couldn't load the product report"
        description={error}
      />
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Product statistics */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
        <StatsCard
          title="Total products"
          value={String(stats.total)}
          icon={Package}
          loading={loading}
        />

        <StatsCard
          title="Active"
          value={String(stats.active)}
          loading={loading}
        />

        <StatsCard
          title="Draft"
          value={String(stats.draft)}
          icon={FileEdit}
          loading={loading}
        />

        <StatsCard
          title="Out of stock"
          value={String(stats.outOfStock)}
          icon={PackageX}
          loading={loading}
        />

        <StatsCard
          title="Archived"
          value={String(stats.archived)}
          icon={Archive}
          loading={loading}
        />
      </div>

      {/* Reports */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        {/* Catalog by category */}
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50 px-3.5 py-3 sm:px-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="text-sm font-semibold tracking-tight">
                  Catalog by category
                </CardTitle>

                <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">
                  Products and catalog value by category
                </p>
              </div>

              <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary sm:text-xs">
                {byCategory.length}
                <span className="hidden sm:inline"> categories</span>
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="h-[180px] animate-pulse bg-muted/40 sm:h-[220px]" />
            ) : byCategory.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-muted-foreground">
                No products yet
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="h-9 px-3 text-[11px] font-medium text-muted-foreground sm:px-5 sm:text-xs">
                        Category
                      </TableHead>

                      <TableHead className="h-9 px-3 text-right text-[11px] font-medium text-muted-foreground sm:px-5 sm:text-xs">
                        Products
                      </TableHead>

                      <TableHead className="h-9 px-3 text-right text-[11px] font-medium text-muted-foreground sm:px-5 sm:text-xs">
                        Value
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {byCategory.map((row) => (
                      <TableRow
                        key={row.category}
                        className="border-border/40 hover:bg-muted/40"
                      >
                        <TableCell className="max-w-[150px] truncate px-3 py-2.5 text-xs sm:max-w-none sm:px-5 sm:py-3">
                          <span className="font-medium text-foreground">
                            {row.category}
                          </span>
                        </TableCell>

                        <TableCell className="px-3 py-2.5 text-right text-xs tabular-nums text-muted-foreground sm:px-5 sm:py-3">
                          {row.count}
                        </TableCell>

                        <TableCell className="px-3 py-2.5 text-right text-xs font-medium tabular-nums text-foreground sm:px-5 sm:py-3">
                          {formatCurrency(row.catalogValue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top sellers */}
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50 px-3.5 py-3 sm:px-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="text-sm font-semibold tracking-tight">
                  Top sellers
                </CardTitle>

                <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">
                  Best-performing products over the last 90 days
                </p>
              </div>

              <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary sm:text-xs">
                90 days
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="h-[180px] animate-pulse bg-muted/40 sm:h-[220px]" />
            ) : topProducts.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-muted-foreground">
                No product sales in the last 90 days
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="h-9 px-3 text-[11px] font-medium text-muted-foreground sm:px-5 sm:text-xs">
                        Product
                      </TableHead>

                      <TableHead className="h-9 px-3 text-right text-[11px] font-medium text-muted-foreground sm:px-5 sm:text-xs">
                        Qty
                      </TableHead>

                      <TableHead className="h-9 px-3 text-right text-[11px] font-medium text-muted-foreground sm:px-5 sm:text-xs">
                        Revenue
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {topProducts.map((product) => (
                      <TableRow
                        key={product.name}
                        className="border-border/40 hover:bg-muted/40"
                      >
                        <TableCell className="max-w-[170px] truncate px-3 py-2.5 text-xs sm:max-w-none sm:px-5 sm:py-3">
                          <span className="font-medium text-foreground">
                            {product.name}
                          </span>
                        </TableCell>

                        <TableCell className="px-3 py-2.5 text-right text-xs tabular-nums text-muted-foreground sm:px-5 sm:py-3">
                          {product.quantity}
                        </TableCell>

                        <TableCell className="px-3 py-2.5 text-right text-xs font-medium tabular-nums text-foreground sm:px-5 sm:py-3">
                          {formatCurrency(product.revenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}