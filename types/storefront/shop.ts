// types/shop.ts

import type { ProductVariant } from "@/types/product";

export type ViewMode = "grid" | "list";

export type SortKey =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "az";

export interface SortOption {
  value: SortKey;
  label: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand?: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  image?: string;
  rating?: number;
  reviews?: number;
  featured?: boolean;
  isNewArrival?: boolean;
  createdAt?: number;
  /** Present only for variant products. Empty/undefined = simple product. */
  variants?: ProductVariant[];
}

export type Availability = "in-stock" | "out-of-stock";

export type ArrayFilterKey = "category" | "brand" | "availability" | "offers";

export type OfferKey = "featured" | "new" | "sale";

export interface PriceRange {
  min: number;
  max: number;
}

export const PRICE_BOUNDS: PriceRange = {
  min: 0,
  max: 100000,
};

export interface FilterState {
  search: string;
  category: string[];
  brand: string[];
  availability: Availability[];
  offers: OfferKey[];
  priceRange: PriceRange;
  sort: SortKey;
  view: ViewMode;
}

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  category: [],
  brand: [],
  availability: [],
  offers: [],
  priceRange: { ...PRICE_BOUNDS },
  sort: "featured",
  view: "grid",
};

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

export interface ActiveFilterChip {
  id: string;
  label: string;
  remove: () => void;
}