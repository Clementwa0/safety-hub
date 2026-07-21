"use client";

import { CATEGORIES } from "@/data/products";
import {
  ActiveFiltersSummary,
  CategoriesSection,
  ClearFiltersButton,
  PriceSection,
  SearchSection,
  SectionWrapper,
  SortSection,
} from ".";
import type { FilterState } from "@/hooks/useShopFilters";

interface ShopSidebarProps {
  filters: FilterState;
  activeFilterCount: number;

  toggleArrayFilter: (
    key: "category" | "brand" | "colors" | "sizes" | "availability",
    value: string
  ) => void;
  clearArrayFilter: (
    key: "category" | "brand" | "colors" | "sizes" | "availability"
  ) => void;
  updateFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => void;
  clearFilters: () => void;

  onPriceChange: (min: number, max: number) => void;
}

export default function ShopSidebar({
  filters,
  activeFilterCount,
  toggleArrayFilter,
  clearArrayFilter,
  updateFilter,
  clearFilters,
  onPriceChange,
}: ShopSidebarProps) {
  // Toggle a single category (with "All" handling)
  const handleCategoryToggle = (category: string) => {
    if (category === "All") {
      clearArrayFilter("category");
    } else {
      toggleArrayFilter("category", category);
    }
  };

  // Remove a filter: either a specific value (chip) or the whole group
  const handleRemoveFilter = (key: keyof FilterState, value?: string) => {
    // If no value is given, clear the entire filter group
    if (value === undefined) {
      if (key === "category") clearArrayFilter("category");
      else if (key === "brand") clearArrayFilter("brand");
      else if (key === "colors") clearArrayFilter("colors");
      else if (key === "sizes") clearArrayFilter("sizes");
      else if (key === "availability") clearArrayFilter("availability");
      else if (key === "search") updateFilter("search", "");
      else if (key === "featured") updateFilter("featured", false);
      else if (key === "onSale") updateFilter("onSale", false);
      else if (key === "minRating") updateFilter("minRating", 0);
      else if (key === "priceRange") updateFilter("priceRange", { min: 0, max: 100000 });
      else if (key === "sort") updateFilter("sort", "featured");
      return;
    }

    // Remove a specific value from an array filter
    if (key === "category") toggleArrayFilter("category", value);
    else if (key === "brand") toggleArrayFilter("brand", value);
    else if (key === "colors") toggleArrayFilter("colors", value);
    else if (key === "sizes") toggleArrayFilter("sizes", value);
    else if (key === "availability") toggleArrayFilter("availability", value);
    // For non-array filters, a specific value removal doesn't apply – clear the whole filter instead
    else if (key === "priceRange") updateFilter("priceRange", { min: 0, max: 100000 });
    // (search, featured, etc. are single-value; you can decide to clear them if a specific value is passed)
  };

  return (
    <aside className="rounded-2xl border bg-background shadow-sm">
      {/* Header + active count */}
      <div className="flex items-center justify-between p-5 border-b">
        <h2 className="font-semibold">Filters</h2>
        {activeFilterCount > 0 && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </div>

      {/* Categories */}
      <SectionWrapper
        title="Categories"
        section="categories"
        isExpanded
        onToggle={() => {}}
      >
        <CategoriesSection
          categories={CATEGORIES}
          selectedCategories={filters.category}
          onToggleCategory={handleCategoryToggle}
        />
      </SectionWrapper>

      {/* Price */}
      <SectionWrapper title="Price" section="price" isExpanded onToggle={() => {}}>
        <PriceSection
          minPrice={filters.priceRange.min}
          maxPrice={filters.priceRange.max}
          onPriceChange={onPriceChange}
        />
      </SectionWrapper>
      {/* Active filters summary */}
      <ActiveFiltersSummary
        filters={filters}
        onRemove={handleRemoveFilter}
        onClearAll={clearFilters}
      />

      {/* Clear all */}
      <div className="p-4 border-t">
        <ClearFiltersButton
          onClear={clearFilters}
          hasFilters={activeFilterCount > 0}
        />
      </div>
    </aside>
  );
}