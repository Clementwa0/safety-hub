"use client";

import { LayoutGrid, List, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ActiveFilterChip, SortKey, ViewMode } from "@/types/storefront/shop";
import { SORT_OPTIONS } from "@/lib/shopFilters";

export interface ShopToolbarProps {
  total: number;
  search: string;
  onSearchChange: (value: string) => void;
  sort: SortKey;
  onSortChange: (value: SortKey) => void;
  view: ViewMode;
  onViewChange: (value: ViewMode) => void;
  /** Removable chips; "Clear all" only renders when this is non-empty. */
  activeChips?: ActiveFilterChip[];
  onClearAll?: () => void;
  className?: string;
}

const VIEWS: { value: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { value: "grid", label: "Grid view", icon: LayoutGrid },
  { value: "list", label: "List view", icon: List },
];

/** Search + sort + view toggle + result count + active filter chips. */
export function ShopToolbar({
  total,
  search,
  onSearchChange,
  sort,
  onSortChange,
  view,
  onViewChange,
  activeChips = [],
  onClearAll,
  className,
}: ShopToolbarProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/60 p-3 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search products, brands, SKU…"
            aria-label="Search products"
            className="h-10 rounded-xl pl-9"
          />
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
            {total.toLocaleString()} product{total === 1 ? "" : "s"}
          </p>

          <Select
            value={sort}
            onValueChange={(value) => onSortChange(value as SortKey)}
          >
            <SelectTrigger className="h-10 w-[170px] rounded-xl" aria-label="Sort products">
              <SelectValue>
                {(value) =>
                  SORT_OPTIONS.find((option) => option.value === value)?.label ??
                  "Sort"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div
            role="group"
            aria-label="View mode"
            className="hidden items-center gap-1 rounded-xl border border-border/70 p-1 sm:flex"
          >
            {VIEWS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                aria-label={label}
                aria-pressed={view === value}
                onClick={() => onViewChange(value)}
                className={cn(
                  "rounded-lg p-1.5 text-muted-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none",
                  view === value && "bg-muted text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeChips.length > 0 && (
        <ul className="flex flex-wrap items-center gap-2" aria-label="Active filters">
          {activeChips.map((chip) => (
            <li key={chip.id}>
              <button
                type="button"
                onClick={chip.remove}
                className="group inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 py-1 pl-3 pr-2 text-xs font-medium transition-colors duration-200 hover:border-foreground/30 hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none"
              >
                {chip.label}
                <X
                  aria-hidden="true"
                  className="size-3.5 text-muted-foreground transition-transform duration-200 group-hover:scale-110 group-hover:text-foreground motion-reduce:transition-none"
                />
                <span className="sr-only">Remove filter</span>
              </button>
            </li>
          ))}
          {onClearAll && (
            <li>
              <Button variant="ghost" size="sm" onClick={onClearAll}>
                Clear all
              </Button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
