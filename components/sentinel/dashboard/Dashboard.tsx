"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Boxes, Layers, PackagePlus, Wallet } from "lucide-react";

import StatsCard from "@/components/sentinel/StatsCard";
import ProductTable from "@/components/sentinel/product/ProductTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableSkeleton } from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatKES } from "@/lib/format";
import { categoryService } from "@/services/shared/category.service";
import { productService } from "@/services/shared/product.service";
import type { CategoryWithCount } from "@/types/category";
import type { Product } from "@/types/product";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [nextProducts, nextCategories] = await Promise.all([
        productService.list(),
        categoryService.list(),
      ]);

      setProducts(nextProducts);
      setCategories(nextCategories);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  const stats = useMemo(() => {
    const inventoryValue = products.reduce(
      (total, product) => total + product.price * product.stock,
      0,
    );

    const activeCount = products.filter(
      (product) => (product.status ?? "active") === "active",
    ).length;

    const outOfStock = products.filter((product) => product.stock === 0).length;

    return { inventoryValue, activeCount, outOfStock };
  }, [products]);

  const recentProducts = useMemo(
    () =>
      [...products]
        .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
        .slice(0, 5),
    [products],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="An overview of your catalogue, categories and stock value."
        breadcrumbs={[
          { label: "Admin", href: "/sentinel/dashboard" },
          { label: "Dashboard" },
        ]}
        actions={
          <Button
            nativeButton={false}
            render={<Link href="/sentinel/products/new" />}
          >
            <PackagePlus className="h-4 w-4" />
            Add product
          </Button>
        }
      />

      {error ? (
        <EmptyState
          title="Something went wrong"
          description={error}
          action={
            <Button variant="outline" onClick={() => void load()}>
              Try again
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Total products"
              value={String(products.length)}
              hint={`${stats.activeCount} active`}
              icon={Boxes}
              loading={loading}
            />
            <StatsCard
              title="Categories"
              value={String(categories.length)}
              hint="Across the catalogue"
              icon={Layers}
              loading={loading}
            />
            <StatsCard
              title="Out of stock"
              value={String(stats.outOfStock)}
              hint="Needs restocking"
              icon={PackagePlus}
              loading={loading}
            />
            <StatsCard
              title="Inventory value"
              value={formatKES(stats.inventoryValue)}
              hint="Price x stock"
              icon={Wallet}
              loading={loading}
            />
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>Recent products</CardTitle>
                <CardDescription>
                  The five most recently added items.
                </CardDescription>
              </div>

              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href="/sentinel/products" />}
              >
                View all
              </Button>
            </CardHeader>

            <CardContent className="px-0">
              {loading ? (
                <TableSkeleton rows={5} columns={4} />
              ) : recentProducts.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    title="No products yet"
                    description="Add your first product to see it here."
                    action={
                      <Button
                        nativeButton={false}
                        render={<Link href="/sentinel/products/new" />}
                      >
                        Add product
                      </Button>
                    }
                  />
                </div>
              ) : (
                <ProductTable products={recentProducts} compact />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
