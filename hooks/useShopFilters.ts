"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Sort keys are intentionally limited to what the storefront can actually
 * implement correctly against real product fields (name, price, createdAt).
 * Don't add options here without a matching, correct comparator in
 * ShopPage's sort switch.
 */
export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "az";

export interface FilterState {
  search: string;
  category: string[];
  brand: string[];
  availability: ("in-stock" | "out-of-stock")[];
  featured: boolean;
  newOnly: boolean;
  onSale: boolean;
  priceRange: {
    min: number;
    max: number;
  };
  sort: SortKey;
}

export const PRICE_BOUNDS = { min: 0, max: 100000 };

const DEFAULT_FILTERS: FilterState = {
  search: "",
  category: [],
  brand: [],
  availability: [],
  featured: false,
  newOnly: false,
  onSale: false,
  priceRange: { ...PRICE_BOUNDS },
  sort: "featured",
};

const SORT_KEYS: SortKey[] = ["featured", "newest", "price-asc", "price-desc", "az"];

function parseCsv(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseFiltersFromParams(params: URLSearchParams): FilterState {
  const sortParam = params.get("sort");
  const sort = SORT_KEYS.includes(sortParam as SortKey) ? (sortParam as SortKey) : "featured";

  const minPrice = params.get("minPrice");
  const maxPrice = params.get("maxPrice");

  const availability = parseCsv(params.get("availability")).filter(
    (v): v is "in-stock" | "out-of-stock" => v === "in-stock" || v === "out-of-stock"
  );

  return {
    search: params.get("q") ?? "",
    category: parseCsv(params.get("category")),
    brand: parseCsv(params.get("brand")),
    availability,
    featured: params.get("featured") === "1",
    newOnly: params.get("new") === "1",
    onSale: params.get("sale") === "1",
    priceRange: {
      min: minPrice ? Math.max(PRICE_BOUNDS.min, Number(minPrice) || 0) : PRICE_BOUNDS.min,
      max: maxPrice ? Math.min(PRICE_BOUNDS.max, Number(maxPrice) || PRICE_BOUNDS.max) : PRICE_BOUNDS.max,
    },
    sort,
  };
}

function filtersToParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) params.set("q", filters.search);
  if (filters.category.length) params.set("category", filters.category.join(","));
  if (filters.brand.length) params.set("brand", filters.brand.join(","));
  if (filters.availability.length) params.set("availability", filters.availability.join(","));
  if (filters.featured) params.set("featured", "1");
  if (filters.newOnly) params.set("new", "1");
  if (filters.onSale) params.set("sale", "1");
  if (filters.priceRange.min > PRICE_BOUNDS.min) params.set("minPrice", String(filters.priceRange.min));
  if (filters.priceRange.max < PRICE_BOUNDS.max) params.set("maxPrice", String(filters.priceRange.max));
  if (filters.sort !== "featured") params.set("sort", filters.sort);

  return params;
}

/**
 * Shop filter state, kept in sync with the URL (`?category=...&brand=...`)
 * so the shop page stays shareable and reload-safe. Reads the initial
 * state from the URL on mount and pushes every change back into it with
 * `router.replace` (no history entries, no scroll jump).
 */
export function useShopFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>(() => parseFiltersFromParams(searchParams));

  // If the URL changes from outside this hook (back/forward nav, a link
  // like `/shop?category=Helmets`), re-sync local state from it.
  const lastParamsString = useRef(searchParams.toString());
  useEffect(() => {
    const current = searchParams.toString();
    if (current !== lastParamsString.current) {
      lastParamsString.current = current;
      setFilters(parseFiltersFromParams(searchParams));
    }
  }, [searchParams]);

  const syncUrl = useCallback(
    (next: FilterState) => {
      const params = filtersToParams(next);
      const queryString = params.toString();
      lastParamsString.current = queryString;
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  // Debounce URL writes for free-text search so we're not replacing the
  // URL on every keystroke, while the visible product list still updates
  // instantly from local state.
  const urlSyncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleUrlSync = useCallback(
    (next: FilterState, immediate = false) => {
      if (urlSyncTimeout.current) clearTimeout(urlSyncTimeout.current);
      if (immediate) {
        syncUrl(next);
        return;
      }
      urlSyncTimeout.current = setTimeout(() => syncUrl(next), 400);
    },
    [syncUrl]
  );

  useEffect(() => {
    return () => {
      if (urlSyncTimeout.current) clearTimeout(urlSyncTimeout.current);
    };
  }, []);

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };
        scheduleUrlSync(next, key !== "search");
        return next;
      });
    },
    [scheduleUrlSync]
  );

  const toggleArrayFilter = useCallback(
    (key: "category" | "brand" | "availability", value: string) => {
      setFilters((prev) => {
        const exists = prev[key].includes(value as never);
        const next = {
          ...prev,
          [key]: exists ? prev[key].filter((item) => item !== value) : [...prev[key], value],
        };
        scheduleUrlSync(next, true);
        return next;
      });
    },
    [scheduleUrlSync]
  );

  const clearArrayFilter = useCallback(
    (key: "category" | "brand" | "availability") => {
      setFilters((prev) => {
        const next = { ...prev, [key]: [] };
        scheduleUrlSync(next, true);
        return next;
      });
    },
    [scheduleUrlSync]
  );

  const clearFilters = useCallback(() => {
    const next = { ...DEFAULT_FILTERS };
    setFilters(next);
    scheduleUrlSync(next, true);
  }, [scheduleUrlSync]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += filters.category.length;
    count += filters.brand.length;
    count += filters.availability.length;
    if (filters.search) count++;
    if (filters.featured) count++;
    if (filters.newOnly) count++;
    if (filters.onSale) count++;
    if (filters.priceRange.min > PRICE_BOUNDS.min) count++;
    if (filters.priceRange.max < PRICE_BOUNDS.max) count++;
    return count;
  }, [filters]);

  return {
    filters,
    updateFilter,
    toggleArrayFilter,
    clearArrayFilter,
    clearFilters,
    activeFilterCount,
    hasActiveFilters: activeFilterCount > 0,
  };
}
