"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function Pagination({
  page,
  totalPages,
  total,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: PaginationProps) {
  if (total === 0) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        Page <span className="font-medium text-foreground">{page}</span> of{" "}
        <span className="font-medium text-foreground">{totalPages}</span> · {total} result
        {total === 1 ? "" : "s"}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={!hasPrev}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNext}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
