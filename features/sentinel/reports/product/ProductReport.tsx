"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Package, PackageX, FileEdit, Archive } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
      // Top sellers come from the same authoritative sales figures as the
      // Sales report (last 90 days) rather than being re-derived here from
      // raw order documents.
      const [productList, salesDashboard] = await Promise.all([
        productService.list(),
        salesDashboardService.get({ range: "90d" }),
      ]);
      setProducts(productList);
      setTopProducts(salesDashboard.topProducts);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load the product report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const active = products.filter((p) => (p.status ?? "active") === "active").length;
    const draft = products.filter((p) => p.status === "draft").length;
    const outOfStock = products.filter((p) => p.status === "out_of_stock" || p.stock <= 0).length;
    const archived = products.filter((p) => p.status === "archived").length;
    return { total: products.length, active, draft, outOfStock, archived };
  }, [products]);

  const byCategory = useMemo<CategoryRow[]>(() => {
    const map = new Map<string, CategoryRow>();
    for (const product of products) {
      if (product.status === "archived") continue;
      const key = String(product.category || "Uncategorized");
      const row = map.get(key) ?? { category: key, count: 0, catalogValue: 0 };
      row.count += 1;
      row.catalogValue += product.price * product.stock;
      map.set(key, row);
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [products]);

  if (error) {
    return <EmptyState title="Couldn't load the product report" description={error} />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatsCard title="Total products" value={String(stats.total)} icon={Package} loading={loading} />
        <StatsCard title="Active" value={String(stats.active)} loading={loading} />
        <StatsCard title="Draft" value={String(stats.draft)} icon={FileEdit} loading={loading} />
        <StatsCard title="Out of stock" value={String(stats.outOfStock)} icon={PackageX} loading={loading} />
        <StatsCard title="Archived" value={String(stats.archived)} icon={Archive} loading={loading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-sm font-semibold">Catalog by category</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="h-[220px] animate-pulse rounded bg-muted" />
            ) : byCategory.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">No products yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Products</TableHead>
                    <TableHead className="text-right">Catalog value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byCategory.map((row) => (
                    <TableRow key={row.category}>
                      <TableCell className="font-medium">{row.category}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(row.catalogValue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-sm font-semibold">Top sellers (last 90 days)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="h-[220px] animate-pulse rounded bg-muted" />
            ) : topProducts.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">No product sales in the last 90 days</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product) => (
                    <TableRow key={product.name}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right tabular-nums">{product.quantity}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(product.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
