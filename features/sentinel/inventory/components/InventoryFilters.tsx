"use client";

import { Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STOCK_LEVELS, STOCK_LEVEL_LABELS, type StockLevel } from "../stockStatus";

export const INVENTORY_SORT_OPTIONS = [
  "available-asc",
  "available-desc",
  "reserved-desc",
  "name-asc",
  "value-desc",
] as const;

export type InventorySort = (typeof INVENTORY_SORT_OPTIONS)[number];

const SORT_LABELS: Record<InventorySort, string> = {
  "available-asc": "Available: Low to High",
  "available-desc": "Available: High to Low",
  "reserved-desc": "Reserved: High to Low",
  "name-asc": "Name: A to Z",
  "value-desc": "Value: High to Low",
};

export interface InventoryFiltersValue {
  search: string;
  category: string;
  stockLevel: StockLevel;
  reservedOnly: boolean;
  sort: InventorySort;
}

export const EMPTY_INVENTORY_FILTERS: InventoryFiltersValue = {
  search: "",
  category: "all",
  stockLevel: "all",
  reservedOnly: false,
  sort: "available-asc",
};

export function hasActiveInventoryFilters(value: InventoryFiltersValue): boolean {
  return (
    Boolean(value.search) || value.category !== "all" || value.stockLevel !== "all" || value.reservedOnly
  );
}

interface InventoryFiltersProps {
  value: InventoryFiltersValue;
  onChange: (next: InventoryFiltersValue) => void;
  categories: string[];
}

export default function InventoryFilters({ value, onChange, categories }: InventoryFiltersProps) {
  const set = <K extends keyof InventoryFiltersValue>(key: K, next: InventoryFiltersValue[K]) => {
    onChange({ ...value, [key]: next });
  };

  return (
    <Card>
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
            value={value.stockLevel}
            onValueChange={(v) => {
              if (v !== null) set("stockLevel", v as StockLevel);
            }}
          >
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="All availability">
                {STOCK_LEVEL_LABELS[value.stockLevel]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STOCK_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {STOCK_LEVEL_LABELS[level]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={value.sort}
            onValueChange={(v) => {
              if (v !== null) set("sort", v as InventorySort);
            }}
          >
            <SelectTrigger className="w-full md:w-52">
              <SelectValue placeholder="Sort by">{SORT_LABELS[value.sort]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {INVENTORY_SORT_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {SORT_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => set("reservedOnly", !value.reservedOnly)}>
            <Badge variant={value.reservedOnly ? "default" : "outline"} className="cursor-pointer">
              Has open reservations
            </Badge>
          </button>

          {hasActiveInventoryFilters(value) && (
            <>
              {value.search && (
                <Badge variant="secondary" className="text-xs">
                  &quot;{value.search}&quot;
                </Badge>
              )}
              {value.category !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {value.category}
                </Badge>
              )}
              {value.stockLevel !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {STOCK_LEVEL_LABELS[value.stockLevel]}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange(EMPTY_INVENTORY_FILTERS)}
                className="ml-auto gap-1 text-xs"
              >
                <X className="h-3 w-3" />
                Clear filters
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
