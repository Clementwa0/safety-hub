import {
  PRODUCT_CATEGORIES,
  type Category,
  type Product,
  type ProductStatus,
} from "@/types/product";
import { formatCurrency, formatKES } from "@/lib/format";

export type { Category, Product, ProductStatus };
export { PRODUCT_CATEGORIES, formatCurrency, formatKES };


export const CATEGORIES: string[] = [...PRODUCT_CATEGORIES];


export interface CategoryPreview {
  title: string;
  image: string;
  description?: string;
}

const CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=70";

export const categories: CategoryPreview[] = CATEGORIES.map((title) => ({
  title,
  image: CATEGORY_IMAGE,
  description: `Certified ${title.toLowerCase()} equipment for demanding worksites.`,
}));

const IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=70`;

