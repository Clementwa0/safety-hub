import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SortKey } from "@/hooks/useShopFilters";

// Kept to exactly what the storefront can implement correctly against
// real product fields — see the comment on `SortKey`.
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "az", label: "Name: A-Z" },
];

type Props = {
  total: number;
  query: string;
  onQueryChange: (v: string) => void;
  sort: SortKey;
  onSortChange: (v: SortKey) => void;
  onOpenMobileFilters: () => void;
  activeCount: number;
};

export function ShopToolbar({
  total,
  query,
  onQueryChange,
  sort,
  onSortChange,
  onOpenMobileFilters,
  activeCount,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
            Safety Equipment
          </h1>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {total.toLocaleString()} product{total === 1 ? "" : "s"}
          </p>
        </div>
        <div className="relative w-full max-w-sm shrink-0 sm:w-80">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            placeholder="Search products, brands, SKU…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label="Search products"
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={onOpenMobileFilters}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters {activeCount > 0 && <span className="ml-1 text-xs">({activeCount})</span>}
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Select value={sort} onValueChange={(v) => onSortChange(v as SortKey)}>
            <SelectTrigger className="h-9 w-[190px] text-sm" aria-label="Sort products">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export { SORT_OPTIONS };
