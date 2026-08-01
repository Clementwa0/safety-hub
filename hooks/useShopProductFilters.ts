"use client";

import { useCallback, useMemo, useState } from "react";
import type { Product } from "@/types/product";

/**
 * Storefront equivalent of the admin ProductFilters bar
 * (components/sentinel/products/ProductFilters.tsx) — same fields
 * (search, category, brand, featured, new arrivals, price range), applied
 * client-side over the already-loaded "active" product list.
 */
export interface ShopFilterState {
  search: string;
  category: string;
  brand: string;
  featuredOnly: boolean;
  newOnly: boolean;
  minPrice: string;
  maxPrice: string;
}

export const EMPTY_SHOP_FILTERS: ShopFilterState = {
  search: "",
  category: "all",
  brand: "all",
  featuredOnly: false,
  newOnly: false,
  minPrice: "",
  maxPrice: "",
};

export function useShopProductFilters(products: Product[]) {
  const [filters, setFilters] = useState<ShopFilterState>(EMPTY_SHOP_FILTERS);

  const setField = useCallback(
    <K extends keyof ShopFilterState>(key: K, value: ShopFilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const clearFilters = useCallback(() => setFilters(EMPTY_SHOP_FILTERS), []);

  const categories = useMemo(() => {
    const set = new Set(products.map((product) => String(product.category)).filter(Boolean));
    return Array.from(set).sort();
  }, [products]);

  const brands = useMemo(() => {
    const set = new Set(products.map((product) => product.brand).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [products]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category !== "all") count++;
    if (filters.brand !== "all") count++;
    if (filters.featuredOnly) count++;
    if (filters.newOnly) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    return count;
  }, [filters]);

  const filteredProducts = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    const min = filters.minPrice ? Number(filters.minPrice) : undefined;
    const max = filters.maxPrice ? Number(filters.maxPrice) : undefined;

    return products.filter((product) => {
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        (product.sku ?? "").toLowerCase().includes(term);

      const matchesCategory = filters.category === "all" || String(product.category) === filters.category;
      const matchesBrand = filters.brand === "all" || (product.brand ?? "") === filters.brand;
      const matchesFeatured = !filters.featuredOnly || Boolean(product.featured);
      const matchesNew = !filters.newOnly || Boolean(product.isNewArrival);
      const matchesMin = min === undefined || product.price >= min;
      const matchesMax = max === undefined || product.price <= max;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesBrand &&
        matchesFeatured &&
        matchesNew &&
        matchesMin &&
        matchesMax
      );
    });
  }, [products, filters]);

  return {
    filters,
    setField,
    clearFilters,
    categories,
    brands,
    activeFilterCount,
    hasActiveFilters: activeFilterCount > 0,
    filteredProducts,
  };
}
