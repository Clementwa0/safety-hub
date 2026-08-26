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
import {
  PRODUCT_STATUSES,
  PRODUCT_STATUS_LABELS,
} from "@/types/product";

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

export function hasActiveFilters(
  value: ProductFiltersValue,
): boolean {
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
    onChange({
      ...value,
      [key]: next,
    });
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
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={value.search}
          onChange={(event) =>
            set("search", event.target.value)
          }
          placeholder="Search by name or SKU..."
          className="h-10 pl-9"
        />
      </div>

      {/* Category */}
      <Select
        value={value.category}
        onValueChange={(v) => {
          if (v !== null) {
            set("category", v);
          }
        }}
      >
        <SelectTrigger className="h-10">
          <SelectValue placeholder="All categories">
            {value.category === "all"
              ? "All categories"
              : value.category}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            All categories
          </SelectItem>

          {categories.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Brand */}
      <Select
        value={value.brand}
        onValueChange={(v) => {
          if (v !== null) {
            set("brand", v);
          }
        }}
      >
        <SelectTrigger className="h-10">
          <SelectValue placeholder="All brands">
            {value.brand === "all"
              ? "All brands"
              : value.brand}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            All brands
          </SelectItem>

          {brands.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}
      <Select
        value={value.status}
        onValueChange={(v) => {
          if (v !== null) {
            set("status", v);
          }
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
          <SelectItem value="all">
            All statuses
          </SelectItem>

          {PRODUCT_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {PRODUCT_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Price */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

        <Label className="text-xs text-muted-foreground">
          Price
        </Label>

        <Input
          type="number"
          min={0}
          value={value.minPrice}
          onChange={(e) =>
            set("minPrice", e.target.value)
          }
          placeholder="Min"
          className="h-8 w-20"
        />

        <span className="text-xs text-muted-foreground">
          to
        </span>

        <Input
          type="number"
          min={0}
          value={value.maxPrice}
          onChange={(e) =>
            set("maxPrice", e.target.value)
          }
          placeholder="Max"
          className="h-8 w-20"
        />
      </div>

      {/* Boolean filters */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            set("featuredOnly", !value.featuredOnly)
          }
        >
          <Badge
            variant={
              value.featuredOnly
                ? "default"
                : "outline"
            }
            className="cursor-pointer"
          >
            Featured only
          </Badge>
        </button>

        <button
          type="button"
          onClick={() =>
            set("newOnly", !value.newOnly)
          }
        >
          <Badge
            variant={
              value.newOnly
                ? "default"
                : "outline"
            }
            className="cursor-pointer"
          >
            New arrivals only
          </Badge>
        </button>
      </div>

      {/* Clear */}
      {hasActiveFilters(value) && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={clearFilters}
          className="w-full gap-1 text-xs"
        >
          <X className="h-3 w-3" />
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* ================================================== */}
      {/* DESKTOP */}
      {/* ================================================== */}

      <Card className="hidden md:block">
        <CardContent className="space-y-3 p-4">
          {/* Top filters */}
          <div className="flex flex-col gap-3 md:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={value.search}
                onChange={(e) =>
                  set("search", e.target.value)
                }
                placeholder="Search by name or SKU..."
                className="pl-9"
              />
            </div>

            {/* Category */}
            <Select
              value={value.category}
              onValueChange={(v) => {
                if (v !== null) {
                  set("category", v);
                }
              }}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All categories">
                  {value.category === "all"
                    ? "All categories"
                    : value.category}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All categories
                </SelectItem>

                {categories.map((item) => (
                  <SelectItem
                    key={item}
                    value={item}
                  >
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Brand */}
            <Select
              value={value.brand}
              onValueChange={(v) => {
                if (v !== null) {
                  set("brand", v);
                }
              }}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All brands">
                  {value.brand === "all"
                    ? "All brands"
                    : value.brand}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All brands
                </SelectItem>

                {brands.map((item) => (
                  <SelectItem
                    key={item}
                    value={item}
                  >
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status */}
            <Select
              value={value.status}
              onValueChange={(v) => {
                if (v !== null) {
                  set("status", v);
                }
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
                <SelectItem value="all">
                  All statuses
                </SelectItem>

                {PRODUCT_STATUSES.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                  >
                    {PRODUCT_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bottom filters */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Price */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />

              <Label className="text-xs text-muted-foreground">
                Price
              </Label>

              <Input
                type="number"
                min={0}
                value={value.minPrice}
                onChange={(e) =>
                  set("minPrice", e.target.value)
                }
                placeholder="Min"
                className="h-8 w-24"
              />

              <span className="text-xs text-muted-foreground">
                to
              </span>

              <Input
                type="number"
                min={0}
                value={value.maxPrice}
                onChange={(e) =>
                  set("maxPrice", e.target.value)
                }
                placeholder="Max"
                className="h-8 w-24"
              />
            </div>

            {/* Featured */}
            <button
              type="button"
              onClick={() =>
                set(
                  "featuredOnly",
                  !value.featuredOnly,
                )
              }
            >
              <Badge
                variant={
                  value.featuredOnly
                    ? "default"
                    : "outline"
                }
                className="cursor-pointer"
              >
                Featured only
              </Badge>
            </button>

            {/* New */}
            <button
              type="button"
              onClick={() =>
                set("newOnly", !value.newOnly)
              }
            >
              <Badge
                variant={
                  value.newOnly
                    ? "default"
                    : "outline"
                }
                className="cursor-pointer"
              >
                New arrivals only
              </Badge>
            </button>

            {/* Clear */}
            {hasActiveFilters(value) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onChange(EMPTY_PRODUCT_FILTERS)
                }
                className="ml-auto gap-1 text-xs"
              >
                <X className="h-3 w-3" />
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ================================================== */}
      {/* MOBILE */}
      {/* ================================================== */}

      <div className="md:hidden">
        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={value.search}
            onChange={(e) =>
              set("search", e.target.value)
            }
            placeholder="Search products..."
            className="h-10 pl-9 pr-14"
          />
        </div>

        {/* Active filter chips */}
        {hasActiveFilters(value) && (
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {value.search && (
              <Badge
                variant="secondary"
                className="text-xs"
              >
                "{value.search}"
              </Badge>
            )}

            {value.category !== "all" && (
              <Badge
                variant="secondary"
                className="text-xs"
              >
                {value.category}
              </Badge>
            )}

            {value.brand !== "all" && (
              <Badge
                variant="secondary"
                className="text-xs"
              >
                {value.brand}
              </Badge>
            )}

            {value.status !== "all" && (
              <Badge
                variant="secondary"
                className="text-xs"
              >
                {
                  PRODUCT_STATUS_LABELS[
                    value.status as keyof typeof PRODUCT_STATUS_LABELS
                  ]
                }
              </Badge>
            )}

            {value.featuredOnly && (
              <Badge
                variant="secondary"
                className="text-xs"
              >
                Featured
              </Badge>
            )}

            {value.newOnly && (
              <Badge
                variant="secondary"
                className="text-xs"
              >
                New
              </Badge>
            )}

            {(value.minPrice || value.maxPrice) && (
              <Badge
                variant="secondary"
                className="text-xs"
              >
                KES {value.minPrice || "0"} -{" "}
                {value.maxPrice || "∞"}
              </Badge>
            )}

            <Button
              type="button"
              size="sm"
              onClick={clearFilters}
              className="h-5 gap-1 bg-red-500 px-1.5 text-[10px] hover:bg-red-600 hover:text-white"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          </div>
        )}

        {/* ================================================= */}
        {/* FLOATING FILTER BUTTON */}
        {/* ================================================= */}

        <div
          className="
            fixed
            bottom-16
            right-4
            z-40
          "
        >
          <Button
            type="button"
            onClick={() => setOpen(true)}
            className="
              h-10
              gap-2
              rounded-full
              px-4
              shadow-lg
            "
          >
            <SlidersHorizontal className="h-4 w-4" />

            <span className="text-sm font-medium">
              Filters
            </span>

            {activeCount > 0 && (
              <Badge
                variant="secondary"
                className="
                  h-5
                  min-w-5
                  border-0
                  bg-background
                  px-1.5
                  text-xs
                  text-foreground
                "
              >
                {activeCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* ================================================= */}
        {/* FILTER SHEET */}
        {/* ================================================= */}

        <Sheet
          open={open}
          onOpenChange={setOpen}
        >
          <SheetContent
            side="left"
            className="
              h-full
              w-[85%]
              max-w-sm
              px-4
              pb-6
            "
          >
            <SheetHeader className="mb-5 text-left">
              <SheetTitle>
                Filters
              </SheetTitle>
            </SheetHeader>

            <div className="h-[calc(100vh-100px)] overflow-y-auto pr-1">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

export default ProductFilters;