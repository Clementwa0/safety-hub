"use client";

import { useEffect, useState } from "react";
import { categoryService } from "@/services/category.service";
import type { CategoryWithCount } from "@/types/category";
import { createCategoryLink } from "@/components/common/links";
import { CategoryCard } from "./CategoryCard";

interface CategoryGridProps {
  limit?: number;
}

export function CategoryGrid({ limit }: CategoryGridProps) {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);

  useEffect(() => {
    void categoryService.list().then((items) => setCategories(items));
  }, []);

  const displayedCategories = limit ? categories.slice(0, limit) : categories;

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {displayedCategories.map((category) => (
        <CategoryCard
          key={category.id}
          title={category.name}
          image={category.image ?? "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=70"}
          count={category.productCount ?? 0}
          href={createCategoryLink(category.slug)}
        />
      ))}
    </div>
  );
}