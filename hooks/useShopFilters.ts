"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type {
  ArrayFilterKey,
  Availability,
  FilterState,
  OfferKey,
  PriceRange,
  SortKey,
  ViewMode,
} from "@/types/storefront/shop";

const DEFAULT_PRICE_RANGE: PriceRange = { min: 0, max: 100000 };

const DEFAULT_FILTERS: FilterState = {
  search: "",
  category: [],
  brand: [],
  availability: [],
  offers: [],
  priceRange: { ...DEFAULT_PRICE_RANGE },
  sort: "featured",
  view: "grid",
};

const SORT_KEYS: SortKey[] = ["featured", "newest", "price-asc", "price-desc", "az"];
const VIEW_MODES: ViewMode[] = ["grid", "list"];

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

  const viewParam = params.get("view");
  const view = VIEW_MODES.includes(viewParam as ViewMode) ? (viewParam as ViewMode) : "grid";

  const minPrice = params.get("minPrice");
  const maxPrice = params.get("maxPrice");

  const availability = parseCsv(params.get("availability")).filter(
    (v): v is Availability => v === "in-stock" || v === "out-of-stock"
  );

  const offers = parseCsv(params.get("offers")).filter(
    (v): v is OfferKey => v === "featured" || v === "new" || v === "sale"
  );

  return {
    search: params.get("q") ?? "",
    category: parseCsv(params.get("category")),
    brand: parseCsv(params.get("brand")),
    availability,
    offers,
    priceRange: {
      min: minPrice ? Math.max(DEFAULT_PRICE_RANGE.min, Number(minPrice) || 0) : DEFAULT_PRICE_RANGE.min,
      max: maxPrice ? Math.min(DEFAULT_PRICE_RANGE.max, Number(maxPrice) || DEFAULT_PRICE_RANGE.max) : DEFAULT_PRICE_RANGE.max,
    },
    sort,
    view,
  };
}

function filtersToParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) params.set("q", filters.search);
  if (filters.category.length) params.set("category", filters.category.join(","));
  if (filters.brand.length) params.set("brand", filters.brand.join(","));
  if (filters.availability.length) params.set("availability", filters.availability.join(","));
  if (filters.offers.length) params.set("offers", filters.offers.join(","));
  if (filters.priceRange.min > DEFAULT_PRICE_RANGE.min) params.set("minPrice", String(filters.priceRange.min));
  if (filters.priceRange.max < DEFAULT_PRICE_RANGE.max) params.set("maxPrice", String(filters.priceRange.max));
  if (filters.sort !== "featured") params.set("sort", filters.sort);
  if (filters.view !== "grid") params.set("view", filters.view);

  return params;
}

export interface UseShopFiltersResult {
  filters: FilterState;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  toggleArrayFilter: (key: ArrayFilterKey, value: string) => void;
  setArrayFilter: (key: ArrayFilterKey, values: string[]) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  hasActiveFilters: boolean;
}

export function useShopFilters(): UseShopFiltersResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>(() =>
    parseFiltersFromParams(searchParams)
  );

  const lastParams = useRef(searchParams.toString());
  useEffect(() => {
    const current = searchParams.toString();
    if (current !== lastParams.current) {
      lastParams.current = current;
      setFilters(parseFiltersFromParams(searchParams));
    }
  }, [searchParams]);

  const syncUrl = useCallback(
    (next: FilterState) => {
      const query = filtersToParams(next).toString();
      lastParams.current = query;
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleSync = useCallback(
    (next: FilterState, immediate: boolean) => {
      if (timeout.current) clearTimeout(timeout.current);
      if (immediate) {
        syncUrl(next);
        return;
      }
      timeout.current = setTimeout(() => syncUrl(next), 400);
    },
    [syncUrl]
  );

  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    []
  );

  const updateFilter = useCallback<UseShopFiltersResult["updateFilter"]>(
    (key, value) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };
        scheduleSync(next, key !== "search");
        return next;
      });
    },
    [scheduleSync]
  );

  const setArrayFilter = useCallback(
    (key: ArrayFilterKey, values: string[]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: values } as FilterState;
        scheduleSync(next, true);
        return next;
      });
    },
    [scheduleSync]
  );

  const toggleArrayFilter = useCallback(
    (key: ArrayFilterKey, value: string) => {
      setFilters((prev) => {
        const current = prev[key] as string[];
        const values = current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value];
        const next = { ...prev, [key]: values } as FilterState;
        scheduleSync(next, true);
        return next;
      });
    },
    [scheduleSync]
  );

  const clearFilters = useCallback(() => {
    setFilters((prev) => {
      const next: FilterState = {
        ...DEFAULT_FILTERS,
        priceRange: { ...DEFAULT_PRICE_RANGE },
        sort: prev.sort,
        view: prev.view,
      };
      scheduleSync(next, true);
      return next;
    });
  }, [scheduleSync]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += filters.category.length;
    count += filters.brand.length;
    count += filters.availability.length;
    count += filters.offers.length;
    if (filters.search) count++;
    if (filters.priceRange.min > DEFAULT_PRICE_RANGE.min) count++;
    if (filters.priceRange.max < DEFAULT_PRICE_RANGE.max) count++;
    return count;
  }, [filters]);

  return {
    filters,
    updateFilter,
    toggleArrayFilter,
    setArrayFilter,
    clearFilters,
    activeFilterCount,
    hasActiveFilters: activeFilterCount > 0,
  };
}