interface CategoryStatsProps {
  totalCategories: number;
}

export function CategoryStats({ totalCategories }: CategoryStatsProps) {
  return (
    <div className="rounded-2xl border bg-white px-6 py-4 text-center shadow-sm">
      <p className="text-sm text-muted-foreground">Total Categories</p>
      <p className="mt-1 text-3xl font-bold text-secondary">
        {totalCategories}
      </p>
    </div>
  );
}