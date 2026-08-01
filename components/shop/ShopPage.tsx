"use client";

import { useEffect, useMemo, useState } from "react";

import { productService } from "@/services/product.service";
import ProductGrid from "@/components/products/components/ProductGrid";
import { useShopFilters } from "@/hooks/useShopFilters";
import type { Product } from "@/types/product";

import { MobileFilterBar, } from "./components";
import { ShopToolbar } from "./components/ShopToolbar";
import ShopSidebar from "./components/ShopSidebar";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const items = await productService.list({ status: "active" });
        setProducts(items);
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, []);

  const {
    filters,
    updateFilter,
    toggleArrayFilter,
    clearArrayFilter,
    clearFilters,
    activeFilterCount,
  } = useShopFilters();

  const brands = useMemo(() => {
    const unique = new Set(products.map((p) => p.brand).filter(Boolean));
    return Array.from(unique) as string[];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
      );
    }

    if (filters.category.length > 0) {
      result = result.filter((p) => filters.category.includes(p.category));
    }

    if (filters.featured) {
      result = result.filter((p) => p.featured);
    }

    if (filters.minRating > 0) {
      result = result.filter((p) => (p.rating ?? 0) >= filters.minRating);
    }

    result = result.filter(
      (p) => p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
    );

    switch (filters.sort) {
      case "rating":
        result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
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
      case "za":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return result;
  }, [products, filters]);

  const pageProducts = filteredProducts.slice(0, 24);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <ShopToolbar
        total={filteredProducts.length}
        query={filters.search}
        onQueryChange={(v) => updateFilter("search", v)}
        sort={filters.sort}
        onSortChange={(v) => updateFilter("sort", v)}
        view={view}
        onViewChange={setView}
        onOpenMobileFilters={() => setMobileFiltersOpen(true)}
        activeCount={activeFilterCount}
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <ShopSidebar
              filters={filters}
              activeFilterCount={activeFilterCount}
              toggleArrayFilter={toggleArrayFilter}
              clearArrayFilter={clearArrayFilter}
              updateFilter={updateFilter}
              clearFilters={clearFilters}
              onPriceChange={(min, max) => updateFilter("priceRange", { min, max })}
            />
          </div>
        </div>

        <div>
          <ProductGrid products={pageProducts} loading={loading} />
        </div>
      </div>

      <MobileFilterBar
        onFilterOpen={() => setMobileFiltersOpen(true)}
        onSortOpen={() => setMobileSortOpen(true)}
        activeFilterCount={activeFilterCount}
        totalProducts={filteredProducts.length}
      />

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <ShopSidebar
            filters={filters}
            activeFilterCount={activeFilterCount}
            toggleArrayFilter={toggleArrayFilter}
            clearArrayFilter={clearArrayFilter}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
            onPriceChange={(min, max) => updateFilter("priceRange", { min, max })}
          />
        </div>
      )}

      {mobileSortOpen && <div className="fixed inset-0 z-50 lg:hidden" />}
    </main>
  );
}