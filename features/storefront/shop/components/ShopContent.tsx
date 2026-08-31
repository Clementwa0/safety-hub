"use client";

import { useEffect, useMemo, useState } from "react";
import { PackageOpen, AlertTriangle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useShopFilters } from "@/hooks/useShopFilters";
import { productService } from "@/services/shared/product.service";
import { categoryService } from "@/services/shared/category.service";
import {
  applyFilters,
  buildBrandOptions,
  buildCategoryOptions,
} from "@/lib/shopFilters";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/storefront/shop";
import { hasVariants } from "@/types/product";
import type { CategoryWithCount } from "@/types/category";
import { MobileFilters } from "./MobileFilters";
import { ShopSidebar } from "./ShopSidebar";
import { ShopToolbar } from "./ShopToolbar";
import ProductCard, { ProductCardItem } from "../../catalog/products/components/ProductCard";

const PAGE_SIZE = 24;
const DEFAULT_IMAGE = "/images/placeholder-product.jpg";

function adaptProductForShop(dbProduct: any): Product | null {
  if (!dbProduct || !dbProduct.id) {
    console.warn("Invalid product data:", dbProduct);
    return null;
  }

  return {
    id: dbProduct.id,
    name: dbProduct.name || "Unnamed Product",
    category: dbProduct.category || "Uncategorized",
    brand: dbProduct.brand,
    sku: dbProduct.sku,
    price: dbProduct.price ?? 0,
    compareAtPrice: dbProduct.compareAtPrice,
    stock: dbProduct.stock ?? 0,
    reserved: dbProduct.reserved ?? 0,
    image:
      typeof dbProduct.image === "string"
        ? dbProduct.image
        : dbProduct.image?.src || dbProduct.image?.url || DEFAULT_IMAGE,
    featured: dbProduct.featured ?? false,
    isNewArrival: dbProduct.isNewArrival ?? false,
    createdAt: dbProduct.createdAt,
    variants: Array.isArray(dbProduct.variants) ? dbProduct.variants : undefined,
  };
}

function mapToProductCardItem(product: Product): ProductCardItem {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    image: product.image || DEFAULT_IMAGE,
    stock: product.stock,
    reserved: product.reserved,
    featured: product.featured ?? false,
    compareAtPrice: product.compareAtPrice,
    brand: product.brand,
    isNewArrival: product.isNewArrival ?? false,
    hasVariants: hasVariants(product),
  };
}

export default function ShopContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const dbProducts = await productService.list({ status: "active" });
      const adapted = dbProducts
        .map(adaptProductForShop)
        .filter((p): p is Product => p !== null);
      setProducts(adapted);
    } catch {
      setError("We couldn't load products right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
    void categoryService
      .list()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const {
    filters,
    updateFilter,
    setArrayFilter,
    clearFilters,
    activeFilterCount,
    hasActiveFilters,
  } = useShopFilters();

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters]);

  const categoryOptions = useMemo(() => buildCategoryOptions(products), [products]);
  const brandOptions = useMemo(() => buildBrandOptions(products), [products]);

  const results = useMemo(
    () => applyFilters(products, filters),
    [products, filters]
  );

  const validResults = useMemo(() => {
    return results.filter(
      (p): p is Product => p && typeof p === "object" && "id" in p
    );
  }, [results]);

  const pageProducts = validResults.slice(0, visibleCount);
  const hasMore = validResults.length > pageProducts.length;

  const sidebarProps = {
    filters,
    updateFilter,
    setArrayFilter,
    clearFilters,
    hasActiveFilters,
    categoryOptions,
    brandOptions,
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] 2xl:grid-cols-[360px_1fr]">
          <div className="hidden lg:block">
            <div className="h-[600px] animate-pulse rounded-2xl bg-muted" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center py-8 text-center">
        <div className="mb-4 rounded-full bg-destructive/10 p-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold">Something went wrong</h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{error}</p>
        <Button className="mt-4" onClick={() => void loadProducts()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex gap-4 lg:gap-6 xl:gap-8">
        {/* Sidebar - responsive width */}
        <div className="hidden w-64 shrink-0 lg:block xl:w-72 2xl:w-80">
          <div className="sticky top-8 max-h-[calc(100dvh-4rem)] overflow-y-auto pr-1">
            <ShopSidebar {...sidebarProps} />
          </div>
        </div>

        {/* Main content - takes remaining space */}
        <div className="min-w-0 flex-1 space-y-5">
          <ShopToolbar
            total={validResults.length}
            search={filters.search}
            onSearchChange={(value) => updateFilter("search", value)}
            sort={filters.sort}
            onSortChange={(value) => updateFilter("sort", value)}
            view={filters.view}
            onViewChange={(value) => updateFilter("view", value)}
            onClearAll={hasActiveFilters ? clearFilters : undefined}
          />

          {validResults.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
              <PackageOpen className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium">No products match these filters</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear all filters
                </Button>
                <Link
                  href="/categories"
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Browse categories
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  "gap-3 sm:gap-4",
                  filters.view === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5"
                    : "flex flex-col gap-3"
                )}
              >
                {pageProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={mapToProductCardItem(product)}
                    featured={product.featured ?? false}
                    priority={index < 6}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="flex flex-col items-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  >
                    Load more products
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Showing {pageProducts.length} of {validResults.length}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <MobileFilters
        {...sidebarProps}
        resultCount={validResults.length}
        activeFilterCount={activeFilterCount}
      />
    </div>
  );
}
