"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FulfillmentBadge } from "@/components/sentinel/sales/FulfillmentBadge";
import type { LineItem } from "@/types/sentinel/sales";
import type { ProductAvailability } from "@/services/shared/product.service";

interface StockWarningProps {
  item: LineItem;
  availability: ProductAvailability;
  plan: LineItem["fulfillmentPlan"];
  onFulfillmentChange: (plan: LineItem["fulfillmentPlan"]) => void;
}

export function StockWarning({
  item,
  availability,
  plan,
  onFulfillmentChange,
}: StockWarningProps) {
  const exceeded = Math.max(0, item.quantity - availability.available);

  return (
    <div className="col-span-12 mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
        {exceeded} of {item.quantity} exceed stock ({availability.available} on
        hand)
      </span>

      <FulfillmentBadge plan={plan} />

      <Select
        value={plan}
        onValueChange={(value) =>
          onFulfillmentChange(value as LineItem["fulfillmentPlan"])
        }
      >
        <SelectTrigger className="h-7 w-full border-0 bg-muted/50 text-xs shadow-none focus:ring-1 sm:w-[160px]">
          <SelectValue placeholder="Fulfilment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="partial">Partial – ship on hand</SelectItem>
          <SelectItem value="procurement">Procurement needed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
