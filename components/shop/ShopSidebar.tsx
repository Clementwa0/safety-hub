// components/shop/ShopSidebar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FilterOption, FilterState } from "@/types/storefront/shop";
import type { UseShopFiltersResult } from "@/hooks/useShopFilters";

import { FilterOptionList } from "./FilterOptionList";
import { FilterSection } from "./FilterSection";
import { PriceFilter } from "./PriceFilter";

const PRICE_BOUNDS = { min: 0, max: 100000 };

const AVAILABILITY_OPTIONS: { value: string; label: string }[] = [
  { value: "in-stock", label: "In Stock" },
  { value: "out-of-stock", label: "Out of Stock" },
];

const OFFER_OPTIONS: { value: string; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "new", label: "New Arrivals" },
  { value: "sale", label: "On Sale" },
];

// ✅ Remove "counts" from the Pick
export interface ShopSidebarProps
  extends Pick<
    UseShopFiltersResult,
    "filters" | "updateFilter" | "setArrayFilter" | "clearFilters" | "hasActiveFilters"
  > {
  categoryOptions: FilterOption[];
  brandOptions: FilterOption[];
  className?: string;
}

const staticOptions = (
  options: { value: string; label: string }[],
): FilterOption[] => options;

export function ShopSidebar({
  filters,
  updateFilter,
  setArrayFilter,
  clearFilters,
  hasActiveFilters,
  categoryOptions,
  brandOptions,
  className,
}: ShopSidebarProps) {
  const set = <K extends keyof FilterState>(key: K) =>
    (values: string[]) => setArrayFilter(key as never, values);

  const getCount = (key: keyof FilterState): number => {
    const value = filters[key];
    if (Array.isArray(value)) return value.length;
    if (key === "search") return filters.search ? 1 : 0;
    if (key === "priceRange") {
      const range = filters.priceRange;
      return range.min > PRICE_BOUNDS.min || range.max < PRICE_BOUNDS.max ? 1 : 0;
    }
    return 0;
  };

  return (
    <aside
      aria-label="Product filters"
      className={cn("flex w-full flex-col gap-3", className)}
    >
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold tracking-tight">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>

      <FilterSection title="Categories" count={getCount("category")} defaultOpen>
        <FilterOptionList
          label="Categories"
          options={categoryOptions}
          value={filters.category}
          onChange={set("category")}
          searchable
          searchPlaceholder="Search categories"
          emptyMessage="No categories match"
        />
      </FilterSection>

      <FilterSection title="Brands" count={getCount("brand")} defaultOpen={false}>
        <FilterOptionList
          label="Brands"
          options={brandOptions}
          value={filters.brand}
          onChange={set("brand")}
          searchable
          searchPlaceholder="Search brands"
          emptyMessage="No brands match"
        />
      </FilterSection>

      <FilterSection title="Price" count={getCount("priceRange")} defaultOpen>
        <PriceFilter
          value={filters.priceRange}
          onChange={(range) => updateFilter("priceRange", range)}
        />
      </FilterSection>

      <FilterSection title="Availability" count={getCount("availability")} defaultOpen={false}>
        <FilterOptionList
          label="Availability"
          options={staticOptions(AVAILABILITY_OPTIONS)}
          value={filters.availability}
          onChange={set("availability")}
        />
      </FilterSection>

      <FilterSection title="Offers" count={getCount("offers")} defaultOpen={false}>
        <FilterOptionList
          label="Offers"
          options={staticOptions(OFFER_OPTIONS)}
          value={filters.offers}
          onChange={set("offers")}
        />
      </FilterSection>

      <p className="px-1 text-xs text-muted-foreground">
        Prices shown between {PRICE_BOUNDS.min.toLocaleString()} and{" "}
        {PRICE_BOUNDS.max.toLocaleString()}.
      </p>
    </aside>
  );
}