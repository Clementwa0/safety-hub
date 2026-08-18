"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PRODUCT_STATUSES, PRODUCT_STATUS_LABELS } from "@/types/product";

export interface ProductFiltersValue {
  search: string;
  category: string;
  brand: string;
  status: string;
  featuredOnly: boolean;
  newOnly: boolean;
  minPrice: string;
  maxPrice: string;
}

interface ProductFiltersProps {
  value: ProductFiltersValue;
  onChange: (next: ProductFiltersValue) => void;
  categories: string[];
  brands: string[];
}

export const EMPTY_PRODUCT_FILTERS: ProductFiltersValue = {
  search: "",
  category: "all",
  brand: "all",
  status: "all",
  featuredOnly: false,
  newOnly: false,
  minPrice: "",
  maxPrice: "",
};

export function hasActiveFilters(value: ProductFiltersValue): boolean {
  return (
    Boolean(value.search) ||
    value.category !== "all" ||
    value.brand !== "all" ||
    value.status !== "all" ||
    value.featuredOnly ||
    value.newOnly ||
    Boolean(value.minPrice) ||
    Boolean(value.maxPrice)
  );
}

export function ProductFilters({
  value,
  onChange,
  categories,
  brands,
}: ProductFiltersProps) {
  const [open, setOpen] = useState(false);

  const set = <K extends keyof ProductFiltersValue>(
    key: K,
    next: ProductFiltersValue[K],
  ) => {
    onChange({ ...value, [key]: next });
  };

  const clearFilters = () => {
    onChange(EMPTY_PRODUCT_FILTERS);
    setOpen(false);
  };

  const activeCount = [
    value.search && "search",
    value.category !== "all" && "category",
    value.brand !== "all" && "brand",
    value.status !== "all" && "status",
    value.featuredOnly && "featured",
    value.newOnly && "new",
    value.minPrice && "min",
    value.maxPrice && "max",
  ].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value.search}
          onChange={(event) => set("search", event.target.value)}
          placeholder="Search by name or SKU..."
          className="pl-9 h-10"
        />
      </div>

      <Select
        value={value.category}
        onValueChange={(v) => {
          if (v !== null) set("category", v);
        }}
      >
        <SelectTrigger className="h-10">
          <SelectValue placeholder="All categories">
            {value.category === "all" ? "All categories" : value.category}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.brand}
        onValueChange={(v) => {
          if (v !== null) set("brand", v);
        }}
      >
        <SelectTrigger className="h-10">
          <SelectValue placeholder="All brands">
            {value.brand === "all" ? "All brands" : value.brand}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All brands</SelectItem>
          {brands.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.status}
        onValueChange={(v) => {
          if (v !== null) set("status", v);
        }}
      >
        <SelectTrigger className="h-10">
          <SelectValue placeholder="All statuses">
            {value.status === "all"
              ? "All statuses"
              : PRODUCT_STATUS_LABELS[
                  value.status as keyof typeof PRODUCT_STATUS_LABELS
                ]}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {PRODUCT_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {PRODUCT_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
        <Label className="text-xs text-muted-foreground">Price</Label>
        <Input
          type="number"
          min={0}
          value={value.minPrice}
          onChange={(e) => set("minPrice", e.target.value)}
          placeholder="Min"
          className="h-8 w-20"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <Input
          type="number"
          min={0}
          value={value.maxPrice}
          onChange={(e) => set("maxPrice", e.target.value)}
          placeholder="Max"
          className="h-8 w-20"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => set("featuredOnly", !value.featuredOnly)}>
          <Badge
            variant={value.featuredOnly ? "default" : "outline"}
            className="cursor-pointer"
          >
            Featured only
          </Badge>
        </button>
        <button onClick={() => set("newOnly", !value.newOnly)}>
          <Badge
            variant={value.newOnly ? "default" : "outline"}
            className="cursor-pointer"
          >
            New arrivals only
          </Badge>
        </button>
      </div>

      {hasActiveFilters(value) && (
        <Button
          variant="destructive"
          size="sm"
          onClick={clearFilters}
          className="w-full  gap-1 text-xs"
        >
          <X className="h-3 w-3" />
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop - Full Filters */}
      <Card className="hidden md:block">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={value.search}
                onChange={(e) => set("search", e.target.value)}
                placeholder="Search by name or SKU..."
                className="pl-9"
              />
            </div>

            <Select
              value={value.category}
              onValueChange={(v) => {
                if (v !== null) set("category", v);
              }}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All categories">
                  {value.category === "all" ? "All categories" : value.category}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={value.brand}
              onValueChange={(v) => {
                if (v !== null) set("brand", v);
              }}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All brands">
                  {value.brand === "all" ? "All brands" : value.brand}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All brands</SelectItem>
                {brands.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={value.status}
              onValueChange={(v) => {
                if (v !== null) set("status", v);
              }}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All statuses">
                  {value.status === "all"
                    ? "All statuses"
                    : PRODUCT_STATUS_LABELS[
                        value.status as keyof typeof PRODUCT_STATUS_LABELS
                      ]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {PRODUCT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {PRODUCT_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-xs text-muted-foreground">Price</Label>
              <Input
                type="number"
                min={0}
                value={value.minPrice}
                onChange={(e) => set("minPrice", e.target.value)}
                placeholder="Min"
                className="h-8 w-24"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="number"
                min={0}
                value={value.maxPrice}
                onChange={(e) => set("maxPrice", e.target.value)}
                placeholder="Max"
                className="h-8 w-24"
              />
            </div>

            <button onClick={() => set("featuredOnly", !value.featuredOnly)}>
              <Badge
                variant={value.featuredOnly ? "default" : "outline"}
                className="cursor-pointer"
              >
                Featured only
              </Badge>
            </button>

            <button onClick={() => set("newOnly", !value.newOnly)}>
              <Badge
                variant={value.newOnly ? "default" : "outline"}
                className="cursor-pointer"
              >
                New arrivals only
              </Badge>
            </button>

            {hasActiveFilters(value) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange(EMPTY_PRODUCT_FILTERS)}
                className="ml-auto gap-1 text-xs"
              >
                <X className="h-3 w-3" />
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mobile */}
      <div className="md:hidden">
        {/* Search Bar */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value.search}
            onChange={(e) => set("search", e.target.value)}
            placeholder="Search products..."
            className="h-10 pl-9 pr-14"
          />
        </div>

        {/* Active filter chips */}
        {hasActiveFilters(value) && (
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {value.search && (
              <Badge variant="secondary" className="text-xs">
                "{value.search}"
              </Badge>
            )}
            {value.category !== "all" && (
              <Badge variant="secondary" className="text-xs">
                {value.category}
              </Badge>
            )}
            {value.brand !== "all" && (
              <Badge variant="secondary" className="text-xs">
                {value.brand}
              </Badge>
            )}
            {value.status !== "all" && (
              <Badge variant="secondary" className="text-xs">
                {
                  PRODUCT_STATUS_LABELS[
                    value.status as keyof typeof PRODUCT_STATUS_LABELS
                  ]
                }
              </Badge>
            )}
            {value.featuredOnly && (
              <Badge variant="secondary" className="text-xs">
                Featured
              </Badge>
            )}
            {value.newOnly && (
              <Badge variant="secondary" className="text-xs">
                New
              </Badge>
            )}
            {(value.minPrice || value.maxPrice) && (
              <Badge variant="secondary" className="text-xs">
                ${value.minPrice || "0"} - ${value.maxPrice || "∞"}
              </Badge>
            )}
            <Button
              size="sm"
              onClick={clearFilters}
              className="h-5 px-1.5 text-[10px] bg-red-500  hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          </div>
        )}

        {/* Floating Filter Button */}
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full shadow-lg px-4 py-2 h-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="text-sm font-medium">Filters</span>
          {activeCount > 0 && (
            <Badge className="h-5 px-1.5 bg-white/20 text-primary-foreground border-none text-xs">
              {activeCount}
            </Badge>
          )}
        </Button>

        {/* Filter Sheet */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="bottom"
            className="max-h-[85vh] rounded-t-2xl px-4 pb-6"
          >
            <SheetHeader className="mb-5 text-left">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

export default ProductFilters;
