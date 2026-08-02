"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import SortSection from "./SortSection";
import type { SortKey } from "@/hooks/useShopFilters";

interface MobileSortSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
}

export default function MobileSortSheet({ open, onOpenChange, sort, onSortChange }: MobileSortSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[70vh] rounded-t-2xl p-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle>Sort by</SheetTitle>
        </SheetHeader>
        <div className="p-2">
          <SortSection
            selectedSort={sort}
            onSortChange={(value) => {
              onSortChange(value);
              onOpenChange(false);
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
