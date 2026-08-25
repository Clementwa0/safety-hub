"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

const DEFAULT_PRICE_RANGE: PriceRange = {
  min: 0,
  max: 100000,
};

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

const SORT_KEYS: SortKey[] = [
  "featured",
  "newest",
  "price-asc",
  "price-desc",
  "az",
];

const VIEW_MODES: ViewMode[] = ["grid", "list"];

function parseCsv(value: string | null): string[] {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseFiltersFromParams(
  params: URLSearchParams
): FilterState {
  const sortParam = params.get("sort");

  const sort = SORT_KEYS.includes(sortParam as SortKey)
    ? (sortParam as SortKey)
    : "featured";

  const viewParam = params.get("view");

  const view = VIEW_MODES.includes(viewParam as ViewMode)
    ? (viewParam as ViewMode)
    : "grid";

  const minPriceParam = params.get("minPrice");
  const maxPriceParam = params.get("maxPrice");

  const parsedMinPrice = minPriceParam
    ? Number(minPriceParam)
    : DEFAULT_PRICE_RANGE.min;

  const parsedMaxPrice = maxPriceParam
    ? Number(maxPriceParam)
    : DEFAULT_PRICE_RANGE.max;

  const availability = parseCsv(
    params.get("availability")
  ).filter(
    (value): value is Availability =>
      value === "in-stock" || value === "out-of-stock"
  );

  const offers = parseCsv(params.get("offers")).filter(
    (value): value is OfferKey =>
      value === "featured" ||
      value === "new" ||
      value === "sale"
  );

  return {
    search: params.get("q") ?? "",

    category: parseCsv(params.get("category")),

    brand: parseCsv(params.get("brand")),

    availability,

    offers,

    priceRange: {
      min: Math.max(
        DEFAULT_PRICE_RANGE.min,
        Number.isFinite(parsedMinPrice)
          ? parsedMinPrice
          : DEFAULT_PRICE_RANGE.min
      ),

      max: Math.min(
        DEFAULT_PRICE_RANGE.max,
        Number.isFinite(parsedMaxPrice)
          ? parsedMaxPrice
          : DEFAULT_PRICE_RANGE.max
      ),
    },

    sort,

    view,
  };
}

function filtersToParams(
  filters: FilterState
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search.trim()) {
    params.set("q", filters.search.trim());
  }

  if (filters.category.length) {
    params.set(
      "category",
      filters.category.join(",")
    );
  }

  if (filters.brand.length) {
    params.set(
      "brand",
      filters.brand.join(",")
    );
  }

  if (filters.availability.length) {
    params.set(
      "availability",
      filters.availability.join(",")
    );
  }

  if (filters.offers.length) {
    params.set(
      "offers",
      filters.offers.join(",")
    );
  }

  if (
    filters.priceRange.min >
    DEFAULT_PRICE_RANGE.min
  ) {
    params.set(
      "minPrice",
      String(filters.priceRange.min)
    );
  }

  if (
    filters.priceRange.max <
    DEFAULT_PRICE_RANGE.max
  ) {
    params.set(
      "maxPrice",
      String(filters.priceRange.max)
    );
  }

  if (filters.sort !== "featured") {
    params.set("sort", filters.sort);
  }

  if (filters.view !== "grid") {
    params.set("view", filters.view);
  }

  return params;
}

export interface UseShopFiltersResult {
  filters: FilterState;

  updateFilter: <
    K extends keyof FilterState
  >(
    key: K,
    value: FilterState[K]
  ) => void;

  toggleArrayFilter: (
    key: ArrayFilterKey,
    value: string
  ) => void;

  setArrayFilter: (
    key: ArrayFilterKey,
    values: string[]
  ) => void;

  clearFilters: () => void;

  activeFilterCount: number;

  hasActiveFilters: boolean;
}

export function useShopFilters(): UseShopFiltersResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /*
   * URL currently represented by the local filter state.
   *
   * This prevents the URL-sync effect from continuously
   * replacing the same URL.
   */
  const lastSyncedParams = useRef(
    searchParams.toString()
  );

  /*
   * Used for debouncing search updates.
   */
  const searchTimeout = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  /*
   * Initial state comes directly from the current URL.
   */
  const [filters, setFilters] =
    useState<FilterState>(() =>
      parseFiltersFromParams(searchParams)
    );

  /*
   * Keep local state synchronized with browser
   * back/forward navigation and external URL changes.
   *
   * IMPORTANT:
   * This effect does NOT update the URL.
   */
  useEffect(() => {
    const currentParams = searchParams.toString();

    if (currentParams === lastSyncedParams.current) {
      return;
    }

    lastSyncedParams.current = currentParams;

    setFilters(
      parseFiltersFromParams(searchParams)
    );
  }, [searchParams]);

  /*
   * Single URL synchronization point.
   *
   * No router.replace() is called from inside a
   * setState updater anymore.
   */
  useEffect(() => {
    const query = filtersToParams(filters).toString();

    if (query === lastSyncedParams.current) {
      return;
    }

    lastSyncedParams.current = query;

    const nextUrl = query
      ? `${pathname}?${query}`
      : pathname;

    router.replace(nextUrl, {
      scroll: false,
    });
  }, [filters, pathname, router]);

  /*
   * Cleanup pending search debounce.
   */
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  /*
   * Update a normal filter.
   *
   * This function ONLY changes React state.
   */
  const updateFilter = useCallback<
    UseShopFiltersResult["updateFilter"]
  >((key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  }, []);

  /*
   * Replace an entire array filter.
   *
   * No URL synchronization happens here.
   */
  const setArrayFilter = useCallback(
    (
      key: ArrayFilterKey,
      values: string[]
    ) => {
      setFilters((previous) => ({
        ...previous,
        [key]: [...values],
      }));
    },
    []
  );

  /*
   * Toggle one value in an array filter.
   *
   * No side effects inside the state updater.
   */
  const toggleArrayFilter = useCallback(
    (
      key: ArrayFilterKey,
      value: string
    ) => {
      setFilters((previous) => {
        const current = previous[key] as string[];

        const exists = current.includes(value);

        const values = exists
          ? current.filter(
              (item) => item !== value
            )
          : [...current, value];

        return {
          ...previous,
          [key]: values,
        };
      });
    },
    []
  );

  /*
   * Clear user-applied filters while preserving
   * the current sort and view preferences.
   */
  const clearFilters = useCallback(() => {
    setFilters((previous) => ({
      ...DEFAULT_FILTERS,

      priceRange: {
        ...DEFAULT_PRICE_RANGE,
      },

      sort: previous.sort,

      view: previous.view,
    }));
  }, []);

  /*
   * Count only filters that actually restrict
   * the product catalogue.
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;

    count += filters.category.length;
    count += filters.brand.length;
    count += filters.availability.length;
    count += filters.offers.length;

    if (filters.search.trim()) {
      count += 1;
    }

    if (
      filters.priceRange.min >
      DEFAULT_PRICE_RANGE.min
    ) {
      count += 1;
    }

    if (
      filters.priceRange.max <
      DEFAULT_PRICE_RANGE.max
    ) {
      count += 1;
    }

    return count;
  }, [filters]);

  return {
    filters,

    updateFilter,

    toggleArrayFilter,

    setArrayFilter,

    clearFilters,

    activeFilterCount,

    hasActiveFilters:
      activeFilterCount > 0,
  };
}