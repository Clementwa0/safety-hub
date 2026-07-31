export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  subcategories?: string[];
  createdAt: number;
  updatedAt?: number;
}

export interface CategoryInput {
  name: string;
  description: string;
  image?: string;
  subcategories?: string[];
}

export interface CategoryWithCount extends AdminCategory {
  productCount: number;
}
