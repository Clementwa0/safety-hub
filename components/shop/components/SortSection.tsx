"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SortKey } from "@/hooks/useShopFilters";

interface SortSectionProps {
  selectedSort: SortKey;
  onSortChange?: (sort: SortKey) => void;
}

// Same five options as ShopToolbar's dropdown — kept in one shape here so
// the mobile sort sheet and desktop select never drift apart.
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "az", label: "Name: A-Z" },
];

export default function SortSection({ selectedSort, onSortChange }: SortSectionProps) {
  return (
    <div className="space-y-1">
      {SORT_OPTIONS.map((option) => {
        const selected = option.value === selectedSort;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSortChange?.(option.value)}
            aria-pressed={selected}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition-all",
              "hover:bg-muted",
              selected && "bg-primary/10 font-medium text-primary"
            )}
          >
            {option.label}
            {selected && <Check className="h-4 w-4" />}
          </button>
        );
      })}
    </div>
  );
}
