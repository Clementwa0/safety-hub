"use client";

import { useState } from "react";
import { PRODUCT_CATEGORIES } from "@/types/product";
import {
  ActiveFiltersSummary,
  BrandSection,
  CategoriesSection,
  ClearFiltersButton,
  PriceSection,
  SectionWrapper,
  ToggleFiltersSection,
} from ".";
import type { FilterState } from "@/hooks/useShopFilters";

interface ShopSidebarProps {
  filters: FilterState;
  activeFilterCount: number;
  brands: string[];

  toggleArrayFilter: (key: "category" | "brand" | "availability", value: string) => void;
  clearArrayFilter: (key: "category" | "brand" | "availability") => void;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  clearFilters: () => void;

  onPriceChange: (min: number, max: number) => void;
}

type SectionId = "categories" | "brands" | "price" | "availability";

export default function ShopSidebar({
  filters,
  activeFilterCount,
  brands,
  toggleArrayFilter,
  clearArrayFilter,
  updateFilter,
  clearFilters,
  onPriceChange,
}: ShopSidebarProps) {
  const [expanded, setExpanded] = useState<Record<SectionId, boolean>>({
    categories: true,
    brands: true,
    price: true,
    availability: true,
  });

  const toggleSection = (section: SectionId) =>
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));

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
    if (value === undefined) {
      if (key === "category") clearArrayFilter("category");
      else if (key === "brand") clearArrayFilter("brand");
      else if (key === "availability") clearArrayFilter("availability");
      else if (key === "search") updateFilter("search", "");
      else if (key === "featured") updateFilter("featured", false);
      else if (key === "newOnly") updateFilter("newOnly", false);
      else if (key === "onSale") updateFilter("onSale", false);
      else if (key === "priceRange") updateFilter("priceRange", { min: 0, max: 100000 });
      else if (key === "sort") updateFilter("sort", "featured");
      return;
    }

    if (key === "category") toggleArrayFilter("category", value);
    else if (key === "brand") toggleArrayFilter("brand", value);
    else if (key === "availability") toggleArrayFilter("availability", value);
    else if (key === "priceRange") updateFilter("priceRange", { min: 0, max: 100000 });
  };

  const isInStock = filters.availability.includes("in-stock");
  const isOutOfStock = filters.availability.includes("out-of-stock");

  // Availability is effectively single-select ("All" / "In stock" /
  // "Out of stock") even though it's stored as an array for URL-param
  // consistency with the other checkbox filters — selecting one clears
  // the other rather than combining them.
  const setAvailability = (value: "in-stock" | "out-of-stock") => {
    const alreadySelected = filters.availability.includes(value);
    updateFilter("availability", alreadySelected ? [] : [value]);
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

      <div className="px-2">
        {/* Categories */}
        <SectionWrapper
          title="Categories"
          section="categories"
          isExpanded={expanded.categories}
          onToggle={() => toggleSection("categories")}
        >
          <CategoriesSection
            categories={PRODUCT_CATEGORIES}
            selectedCategories={filters.category}
            onToggleCategory={handleCategoryToggle}
          />
        </SectionWrapper>

        {/* Brands */}
        <SectionWrapper
          title="Brand"
          section="brands"
          isExpanded={expanded.brands}
          onToggle={() => toggleSection("brands")}
          count={filters.brand.length}
        >
          <BrandSection
            brands={brands}
            selectedBrands={filters.brand}
            onToggleBrand={(brand) => toggleArrayFilter("brand", brand)}
          />
        </SectionWrapper>

        {/* Price */}
        <SectionWrapper
          title="Price"
          section="price"
          isExpanded={expanded.price}
          onToggle={() => toggleSection("price")}
        >
          <PriceSection
            minPrice={filters.priceRange.min}
            maxPrice={filters.priceRange.max}
            onPriceChange={onPriceChange}
          />
        </SectionWrapper>

        {/* Availability + merchandising toggles */}
        <SectionWrapper
          title="Availability & offers"
          section="availability"
          isExpanded={expanded.availability}
          onToggle={() => toggleSection("availability")}
        >
          <ToggleFiltersSection
            options={[
              {
                id: "in-stock",
                label: "In stock only",
                checked: isInStock,
                onChange: () => setAvailability("in-stock"),
              },
              {
                id: "out-of-stock",
                label: "Out of stock only",
                checked: isOutOfStock,
                onChange: () => setAvailability("out-of-stock"),
              },
              {
                id: "featured",
                label: "Featured",
                checked: filters.featured,
                onChange: () => updateFilter("featured", !filters.featured),
              },
              {
                id: "new",
                label: "New arrivals",
                checked: filters.newOnly,
                onChange: () => updateFilter("newOnly", !filters.newOnly),
              },
              {
                id: "sale",
                label: "On sale",
                checked: filters.onSale,
                onChange: () => updateFilter("onSale", !filters.onSale),
              },
            ]}
          />
        </SectionWrapper>
      </div>

      {/* Active filters summary */}
      <ActiveFiltersSummary filters={filters} onRemove={handleRemoveFilter} onClearAll={clearFilters} />

      {/* Clear all */}
      <div className="p-4 border-t">
        <ClearFiltersButton onClear={clearFilters} hasFilters={activeFilterCount > 0} />
      </div>
    </aside>
  );
}
