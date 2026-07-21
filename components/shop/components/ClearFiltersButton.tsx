"use client";

import { Button } from "@/components/ui/button";
import { FaRotateLeft } from "react-icons/fa6";
import { cn } from "@/lib/utils";

interface ClearFiltersButtonProps {
  onClear: () => void;
  hasFilters: boolean;
  loading?: boolean;
  className?: string;
}

export default function ClearFiltersButton({
  onClear,
  hasFilters,
  loading = false,
  className,
}: ClearFiltersButtonProps) {
  if (!hasFilters) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClear}
      disabled={loading}
      className={cn(
        "w-full justify-center transition-all duration-200 hover:border-destructive hover:bg-destructive hover:text-destructive-foreground",
        className
      )}
    >
      <FaRotateLeft
        className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
      />
      {loading ? "Clearing..." : "Clear All Filters"}
    </Button>
  );
}