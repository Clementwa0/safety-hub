import { useCallback, useMemo, useState } from "react";

export type SortKey =
  | "featured"
  | "newest"
  | "best-selling"
  | "rating"
  | "price-asc"
  | "price-desc"
  | "az"
  | "za";

export interface FilterState {
  search: string;

  category: string[];
  brand: string[];
  colors: string[];
  sizes: string[];

  availability: ("in-stock" | "out-of-stock")[];

  featured: boolean;
  onSale: boolean;

  minRating: number;

  priceRange: {
    min: number;
    max: number;
  };

  sort: SortKey;
}

const DEFAULT_FILTERS: FilterState = {
  search: "",

  category: [],
  brand: [],
  colors: [],
  sizes: [],

  availability: [],

  featured: false,
  onSale: false,

  minRating: 0,

  priceRange: {
    min: 0,
    max: 100000,
  },

  sort: "featured",
};

export function useShopFilters(
  initialState?: Partial<FilterState>
) {
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    ...initialState,
  });

  const updateFilter = useCallback(
    <K extends keyof FilterState>(
      key: K,
      value: FilterState[K]
    ) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const toggleArrayFilter = useCallback(
    (
      key: "category" | "brand" | "colors" | "sizes" | "availability",
      value: string
    ) => {
      setFilters((prev) => {
        const exists = prev[key].includes(value as never);

        return {
          ...prev,
          [key]: exists
            ? prev[key].filter((item) => item !== value)
            : [...prev[key], value],
        };
      });
    },
    []
  );

 const clearFilters = useCallback(
  (key: "category" | "brand" | "colors" | "sizes" | "availability") => {
    setFilters((prev) => ({ ...prev, [key]: [] }));
  },
  []
);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    count += filters.category.length;
    count += filters.brand.length;
    count += filters.colors.length;
    count += filters.sizes.length;
    count += filters.availability.length;

    if (filters.search) count++;

    if (filters.featured) count++;

    if (filters.onSale) count++;

    if (filters.minRating > 0) count++;

    if (filters.priceRange.min > 0) count++;

    if (filters.priceRange.max < 100000) count++;

    return count;
  }, [filters]);

  return {
    filters,

    updateFilter,

    toggleArrayFilter,

    clearFilters,

    activeFilterCount,

    hasActiveFilters: activeFilterCount > 0,
  };
}