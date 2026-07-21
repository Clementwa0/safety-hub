import { categories, getCategoriesWithCount } from "@/data/products";
import { CategoryCard } from "./CategoryCard";

interface CategoryGridProps {
  limit?: number;
}

function createCategoryLink(category: string): string {
  return `/categories/${encodeURIComponent(category)}`;
}

export function CategoryGrid({ limit }: CategoryGridProps) {
  const categoriesWithCount = getCategoriesWithCount();

  const displayedCategories = limit
    ? categories.slice(0, limit)
    : categories;

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {displayedCategories.map((category) => {
        const categoryData = categoriesWithCount.find(
          (c: { name: string; count: number }) => c.name === category.title
        );

        return (
          <CategoryCard
            key={category.title}
            title={category.title}
            image={category.image}
            count={categoryData?.count ?? 0}
            href={createCategoryLink(category.title)}
          />
        );
      })}
    </div>
  );
}