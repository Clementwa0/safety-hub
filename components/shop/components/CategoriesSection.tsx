import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoriesSectionProps {
  categories: readonly string[];
  selectedCategories: string[];                    // array now
  onToggleCategory: (category: string) => void;    // toggle a single category
}

export default function CategoriesSection({
  categories,
  selectedCategories,
  onToggleCategory,
}: CategoriesSectionProps) {
  const allCategories = ["All", ...categories];

  // "All" selected means the array is empty
  const isAllSelected = selectedCategories.length === 0;

  return (
    <div className="space-y-1">
      {allCategories.map((category) => {
        const selected =
          category === "All" ? isAllSelected : selectedCategories.includes(category);

        return (
          <button
            key={category}
            type="button"
            onClick={() => {
              if (category === "All") {
                // Selecting "All" clears all other categories
                onToggleCategory("__ALL__");
              } else {
                onToggleCategory(category);
              }
            }}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-all",
              "hover:bg-muted",
              selected && "bg-primary/10 text-primary"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/40"
                )}
              >
                {selected && <Check className="h-3 w-3" />}
              </div>
              <span>{category}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}