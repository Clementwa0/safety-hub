"use client";

import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSize?: boolean;
  className?: string;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [
  10,
  25,
  50,
  100,
  1000,
];

export function Pagination({
  page,
  totalPages,
  total,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  onPageChange,
  pageSize = 25,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  showPageSize = false,
  className,
}: PaginationProps) {
  if (total === 0) return null;

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (page <= 3) {
      for (let i = 1; i <= 4; i++) {
        pages.push(i);
      }

      pages.push("ellipsis");
      pages.push(totalPages);
    } else if (page >= totalPages - 2) {
      pages.push(1);
      pages.push("ellipsis");

      for (
        let i = totalPages - 3;
        i <= totalPages;
        i++
      ) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push("ellipsis");

      for (
        let i = page - 1;
        i <= page + 1;
        i++
      ) {
        pages.push(i);
      }

      pages.push("ellipsis");
      pages.push(totalPages);
    }

    return pages;
  };

  const startItem =
    (page - 1) * pageSize + 1;

  const endItem = Math.min(
    page * pageSize,
    total,
  );

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-between gap-3 py-3 sm:flex-row",
        className,
      )}
    >
      {/* Results + page size */}
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {startItem}
          </span>{" "}
          to{" "}
          <span className="font-medium text-foreground">
            {endItem}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {total}
          </span>{" "}
          results
        </p>

        {showPageSize &&
          onPageSizeChange && (
            <Select
              value={String(pageSize)}
              onValueChange={(value) =>
                onPageSizeChange(
                  Number(value),
                )
              }
            >
              <SelectTrigger className="h-8 w-[70px] text-xs">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {pageSizeOptions.map(
                  (size) => (
                    <SelectItem
                      key={size}
                      value={String(size)}
                    >
                      {size}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={!hasPrev}
          aria-label="Previous page"
          className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
        >
          <ChevronLeft className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">
            Previous
          </span>
        </Button>

        {/* Page numbers */}
        <div className="hidden items-center gap-1 sm:flex">
          {getPageNumbers().map(
            (item, index) => (
              <Button
                key={`${item}-${index}`}
                variant={
                  item === page
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => {
                  if (
                    typeof item ===
                      "number" &&
                    onPageChange
                  ) {
                    onPageChange(item);
                  }
                }}
                disabled={
                  typeof item !== "number"
                }
                className={cn(
                  "h-8 w-8 p-0 text-xs",
                  item === page &&
                    "pointer-events-none",
                )}
              >
                {item === "ellipsis" ? (
                  <MoreHorizontal className="h-3.5 w-3.5" />
                ) : (
                  item
                )}
              </Button>
            ),
          )}
        </div>

        {/* Mobile indicator */}
        <span className="px-2 text-xs text-muted-foreground sm:hidden">
          {page} / {totalPages}
        </span>

        {/* Next */}
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNext}
          aria-label="Next page"
          className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
        >
          <span className="hidden sm:inline">
            Next
          </span>
          <ChevronRight className="h-4 w-4 sm:ml-1" />
        </Button>
      </div>
    </div>
  );
}

export default Pagination;