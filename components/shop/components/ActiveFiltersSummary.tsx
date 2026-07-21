"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FilterState } from "@/hooks/useShopFilters";

const MAX_PRICE = 100000;

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);

interface Props {
  filters: FilterState;
  onRemove: (key: keyof FilterState, value?: string) => void;
  onClearAll: () => void;
}

export default function ActiveFiltersSummary({
  filters,
  onRemove,
  onClearAll,
}: Props) {
  const chips: {
    id: string;
    label: string;
    key: keyof FilterState;
    value?: string;
  }[] = [];

  // Search
  if (filters.search) {
    chips.push({
      id: "search",
      label: `"${filters.search}"`,
      key: "search",
    });
  }

  // Categories
  filters.category.forEach((category) => {
    chips.push({
      id: `category-${category}`,
      label: category,
      key: "category",
      value: category,
    });
  });

  // Brands
  filters.brand.forEach((brand) => {
    chips.push({
      id: `brand-${brand}`,
      label: brand,
      key: "brand",
      value: brand,
    });
  });

  // Availability
  filters.availability.forEach((status) => {
    chips.push({
      id: `availability-${status}`,
      label: status === "in-stock" ? "In Stock" : "Out of Stock",
      key: "availability",
      value: status,
    });
  });

  // Featured
  if (filters.featured) {
    chips.push({
      id: "featured",
      label: "Featured",
      key: "featured",
    });
  }

  // On Sale
  if (filters.onSale) {
    chips.push({
      id: "sale",
      label: "On Sale",
      key: "onSale",
    });
  }

  // Price
  if (
    filters.priceRange.min > 0 ||
    filters.priceRange.max < MAX_PRICE
  ) {
    chips.push({
      id: "price",
      label: `${formatPrice(filters.priceRange.min)} – ${formatPrice(
        filters.priceRange.max
      )}`,
      key: "priceRange",
    });
  }

  // Sort
  if (filters.sort !== "featured") {
    const labels: Record<string, string> = {
      newest: "Newest",
      "best-selling": "Best Selling",
      rating: "Highest Rated",
      "price-asc": "Price ↑",
      "price-desc": "Price ↓",
      az: "A → Z",
      za: "Z → A",
    };

    chips.push({
      id: "sort",
      label: labels[filters.sort] ?? filters.sort,
      key: "sort",
    });
  }

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3">
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <Badge
            key={chip.id}
            variant="secondary"
            className="flex items-center gap-1 rounded-full px-3 py-1"
          >
            <span>{chip.label}</span>

            <button
              onClick={() => onRemove(chip.key, chip.value)}
              className="rounded-full p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
              aria-label={`Remove ${chip.label}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="shrink-0"
      >
        Clear All
      </Button>
    </div>
  );
}