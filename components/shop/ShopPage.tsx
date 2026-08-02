"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import ProductGrid from "@/components/products/components/ProductGrid";
import { Breadcrumb } from "@/components/shared/ui-bits";
import { Button } from "@/components/ui/button";
import { useShopFilters } from "@/hooks/useShopFilters";
import type { Product } from "@/types/product";
import type { CategoryWithCount } from "@/types/category";
import { cn } from "@/lib/utils";

import { MobileFilterBar, MobileShopSidebar, MobileSortSheet } from "./components";
import { ShopToolbar } from "./components/ShopToolbar";
import ShopSidebar from "./components/ShopSidebar";

const PAGE_SIZE = 24;

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await productService.list({ status: "active" });
      setProducts(items);
    } catch {
      setError("We couldn't load products right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
    void categoryService.list().then(setCategories).catch(() => setCategories([]));
  }, []);

  const {
    filters,
    updateFilter,
    toggleArrayFilter,
    clearArrayFilter,
    clearFilters,
    activeFilterCount,
  } = useShopFilters();

  // Reset how many products are visible whenever the filters change, so
  // "Load more" always starts from the first page of the new result set.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters]);

  const brands = useMemo(() => {
    const unique = new Set(products.map((p) => p.brand).filter(Boolean));
    return Array.from(unique).sort() as string[];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.category?.toString().toLowerCase().includes(q)
      );
    }

    if (filters.category.length > 0) {
      result = result.filter((p) => filters.category.includes(p.category));
    }

    if (filters.brand.length > 0) {
      result = result.filter((p) => p.brand && filters.brand.includes(p.brand));
    }

    if (filters.availability.includes("in-stock")) {
      result = result.filter((p) => p.stock > 0);
    } else if (filters.availability.includes("out-of-stock")) {
      result = result.filter((p) => p.stock <= 0);
    }

    if (filters.featured) {
      result = result.filter((p) => p.featured);
    }

    if (filters.newOnly) {
      result = result.filter((p) => p.isNewArrival);
    }

    if (filters.onSale) {
      result = result.filter((p) => typeof p.compareAtPrice === "number" && p.compareAtPrice > p.price);
    }

    result = result.filter(
      (p) => p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
    );

    switch (filters.sort) {
      case "newest":
        result.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "az":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // "Relevance" — featured items first, then newest.
        result.sort((a, b) => {
          if (Boolean(b.featured) !== Boolean(a.featured)) return Number(b.featured) - Number(a.featured);
          return (b.createdAt ?? 0) - (a.createdAt ?? 0);
        });
        break;
    }

    return result;
  }, [products, filters]);

  const pageProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = filteredProducts.length > pageProducts.length;

  const sidebarProps = {
    filters,
    activeFilterCount,
    brands,
    toggleArrayFilter,
    clearArrayFilter,
    updateFilter,
    clearFilters,
    onPriceChange: (min: number, max: number) => updateFilter("priceRange", { min, max }),
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:pb-14 lg:pt-10">
      <Breadcrumb
        className="mb-4 rounded-xl bg-primary px-4 py-2.5"
        items={[{ label: "Home", href: "/" }, { label: "Shop" }]}
      />

      {categories.length > 0 && (
        <div className="mb-6 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <button
            type="button"
            onClick={() => clearArrayFilter("category")}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition",
              filters.category.length === 0
                ? "border-secondary bg-secondary text-white"
                : "border-border bg-background text-foreground hover:border-secondary/50"
            )}
          >
            All
          </button>
          {categories.map((category) => {
            const active = filters.category.includes(category.name);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleArrayFilter("category", category.name)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition",
                  active
                    ? "border-secondary bg-secondary text-white"
                    : "border-border bg-background text-foreground hover:border-secondary/50"
                )}
              >
                {category.name}
                <span className={cn("ml-1.5 text-xs", active ? "text-white/80" : "text-muted-foreground")}>
                  {category.productCount ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <ShopToolbar
        total={filteredProducts.length}
        query={filters.search}
        onQueryChange={(v) => updateFilter("search", v)}
        sort={filters.sort}
        onSortChange={(v) => updateFilter("sort", v)}
        onOpenMobileFilters={() => setMobileFiltersOpen(true)}
        activeCount={activeFilterCount}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <ShopSidebar {...sidebarProps} />
          </div>
        </div>

        <div>
          {error ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white p-8 text-center">
              <div className="mb-4 rounded-full bg-destructive/10 p-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-primary">Something went wrong</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">{error}</p>
              <Button className="mt-4" onClick={() => void loadProducts()}>
                Try again
              </Button>
            </div>
          ) : (
            <>
              <ProductGrid products={pageProducts} loading={loading} />

              {!loading && hasMore && (
                <div className="mt-8 flex flex-col items-center gap-2">
                  <Button variant="outline" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                    Load more products
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Showing {pageProducts.length} of {filteredProducts.length}
                  </p>
                </div>
              )}

              {!loading && !error && filteredProducts.length === 0 && products.length > 0 && (
                <div className="mt-3 text-center text-sm text-muted-foreground">
                  Nothing matches those filters.{" "}
                  <button type="button" onClick={clearFilters} className="font-medium text-secondary underline">
                    Clear filters
                  </button>{" "}
                  or{" "}
                  <Link href="/categories" className="font-medium text-secondary underline">
                    browse categories
                  </Link>
                  .
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <MobileFilterBar
        onFilterOpen={() => setMobileFiltersOpen(true)}
        onSortOpen={() => setMobileSortOpen(true)}
        activeFilterCount={activeFilterCount}
        totalProducts={filteredProducts.length}
      />

      <MobileShopSidebar open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen} {...sidebarProps} />

      <MobileSortSheet
        open={mobileSortOpen}
        onOpenChange={setMobileSortOpen}
        sort={filters.sort}
        onSortChange={(v) => updateFilter("sort", v)}
      />
    </main>
  );
}
