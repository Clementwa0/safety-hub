"use client";

import { useEffect, useState } from "react";
import { categoryService } from "@/services/shared/category.service";
import type { CategoryWithCount } from "@/types/category";
import { createCategoryLink } from "@/components/common/links";
import { CategoryCard } from "./CategoryCard";

interface CategoryGridProps {
  limit?: number;
}

function CategorySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200">
        <div className="aspect-[4/3] bg-slate-200" />
        <div className="p-4">
          <div className="h-5 w-3/4 rounded bg-slate-200 mb-2" />
          <div className="h-4 w-1/2 rounded bg-slate-200" />
          <div className="mt-3 flex items-center justify-between">
            <div className="h-4 w-16 rounded bg-slate-200" />
            <div className="h-8 w-8 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CategoryGrid({ limit }: CategoryGridProps) {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      try {
        const items = await categoryService.list();
        if (mounted) {
          setCategories(items);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const displayedCategories = limit ? categories.slice(0, limit) : categories;

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: limit || 4 }).map((_, index) => (
          <CategorySkeleton key={index} />
        ))}
      </div>
    );
  }

  // Don't render anything if no categories
  if (displayedCategories.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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