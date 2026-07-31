"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";

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

export function ProductFilters({ value, onChange, categories, brands }: ProductFiltersProps) {
  const set = <K extends keyof ProductFiltersValue>(key: K, next: ProductFiltersValue[K]) => {
    onChange({ ...value, [key]: next });
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={value.search}
              onChange={(event) => set("search", event.target.value)}
              placeholder="Search by name or SKU..."
              className="pl-9"
              aria-label="Search products"
            />
          </div>

          <Select
            value={value.category}
            onValueChange={(v) => typeof v === "string" && set("category", v)}
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
            onValueChange={(v) => typeof v === "string" && set("brand", v)}
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
            onValueChange={(v) => typeof v === "string" && set("status", v)}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="All statuses">
                {value.status === "all" ? "All statuses" : PRODUCT_STATUS_LABELS[value.status as keyof typeof PRODUCT_STATUS_LABELS]}
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
            <Label htmlFor="min-price" className="text-xs text-muted-foreground">
              Price
            </Label>
            <Input
              id="min-price"
              type="number"
              min={0}
              value={value.minPrice}
              onChange={(event) => set("minPrice", event.target.value)}
              placeholder="Min"
              className="h-8 w-24"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="number"
              min={0}
              value={value.maxPrice}
              onChange={(event) => set("maxPrice", event.target.value)}
              placeholder="Max"
              className="h-8 w-24"
            />
          </div>

          <button
            type="button"
            onClick={() => set("featuredOnly", !value.featuredOnly)}
            className="focus:outline-none"
          >
            <Badge variant={value.featuredOnly ? "default" : "outline"} className="cursor-pointer">
              Featured only
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => set("newOnly", !value.newOnly)}
            className="focus:outline-none"
          >
            <Badge variant={value.newOnly ? "default" : "outline"} className="cursor-pointer">
              New arrivals only
            </Badge>
          </button>

          {hasActiveFilters(value) ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange(EMPTY_PRODUCT_FILTERS)}
              className="ml-auto gap-1 text-xs"
            >
              <X className="h-3 w-3" />
              Clear filters
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductFilters;
