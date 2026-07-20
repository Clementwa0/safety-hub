import type { StaticImageData } from "next/image";

export const PRODUCT_CATEGORIES = [
  "Head Protection",
  "Eye Protection",
  "Ear Protection",
  "Body Protection",
  "Protective Clothing",
  "Hand Protection",
  "Foot Protection",
  "Respiratory Protection",
  "Safety Equipment",
] as const;

export type Category = (typeof PRODUCT_CATEGORIES)[number];

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  subcategory: string;
  price: number;
  image: StaticImageData;
  stock: number;
  description: string;
  featured?: boolean;
  specs: ProductSpec[];
  compareAtPrice?: number;
  images?: StaticImageData[];
  rating?: number;
  reviews?: number;
  sku?: string;
  features?: string[];
  isNew?: boolean;
  createdAt?: number;
  popularity?: number;
  brand?: string;
  weight?: string;
  dimensions?: string;
  warranty?: string;
  certifications?: string[];
}
