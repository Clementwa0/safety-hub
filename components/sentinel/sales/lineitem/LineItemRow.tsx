"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatKES } from "@/lib/format";
import { lineItemTotal } from "@/lib/sales";

import type { Product } from "@/types/product";
import type { LineItem } from "@/types/sentinel/sales";
import type { ProductAvailability } from "@/services/shared/product.service";

import { ProductCombobox } from "./ProductCombobox";
import { StockWarning } from "./StockWarning";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface LineItemRowProps {
  item: LineItem;
  products: Product[];
  availability?: ProductAvailability;
  stockAware: boolean;
  comboboxOpen: boolean;
  onComboboxOpenChange: (open: boolean) => void;
  onProductSelect: (productId: string) => void;
  onChange: (patch: Partial<LineItem>) => void;
  onRemove: () => void;
  fulfillmentPlan?: LineItem["fulfillmentPlan"];
  onFulfillmentChange: (plan: LineItem["fulfillmentPlan"]) => void;
}

function planFor(
  requested: number,
  available: number
): LineItem["fulfillmentPlan"] {
  if (available >= requested) return "available";
  if (available > 0) return "partial";
  return "procurement";
}

export function LineItemRow({
  item,
  products,
  availability,
  stockAware,
  comboboxOpen,
  onComboboxOpenChange,
  onProductSelect,
  onChange,
  onRemove,
  fulfillmentPlan,
  onFulfillmentChange,
}: LineItemRowProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const plan =
    stockAware && availability
      ? planFor(item.quantity, availability.available)
      : undefined;

  const effectivePlan =
    item.fulfillmentPlan ?? fulfillmentPlan ?? plan;

  const showWarning =
    stockAware &&
    !!availability &&
    !!plan &&
    plan !== "available";

  // ================= DESKTOP LAYOUT =================
  if (isDesktop) {
    return (
      <div className="group border-b border-border/30 py-3 last:border-b-0">
        <div className="grid grid-cols-12 gap-2">
          {/* Item */}
          <div className="col-span-4 flex gap-2">
            <ProductCombobox
              itemId={item.id}
              productId={item.productId}
              products={products}
              open={comboboxOpen}
              onOpenChange={onComboboxOpenChange}
              onSelect={onProductSelect}
            />

            <Input
              value={item.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Item name"
              className="h-9 min-w-0 flex-1 border-0 bg-muted/50 px-3 text-sm shadow-none focus:ring-1"
            />
          </div>

          {/* Quantity */}
          <div className="col-span-2">
            <Input
              type="number"
              min={1}
              value={String(item.quantity)}
              onChange={(e) =>
                onChange({
                  quantity: Math.max(1, Number(e.target.value) || 1),
                })
              }
              className="h-9 w-full border-0 bg-muted/50 text-right shadow-none focus:ring-1"
            />
          </div>

          {/* Price */}
          <div className="col-span-2">
            <Input
              type="number"
              min={0}
              step={0.01}
              value={String(item.unitPrice)}
              onChange={(e) =>
                onChange({
                  unitPrice: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className="h-9 w-full border-0 bg-muted/50 text-right shadow-none focus:ring-1"
            />
          </div>

          {/* Discount */}
          <div className="col-span-1">
            <Input
              type="number"
              min={0}
              max={100}
              value={String(item.discount)}
              onChange={(e) =>
                onChange({
                  discount: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                })
              }
              className="h-9 w-full border-0 bg-muted/50 text-right shadow-none focus:ring-1"
            />
          </div>

          {/* Tax */}
          <div className="col-span-1">
            <Input
              type="number"
              min={0}
              max={100}
              value={String(item.taxRate)}
              onChange={(e) =>
                onChange({
                  taxRate: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                })
              }
              className="h-9 w-full border-0 bg-muted/50 text-right shadow-none focus:ring-1"
            />
          </div>

          {/* Total */}
          <div className="col-span-2 flex items-center justify-between gap-1">
            <span className="text-sm font-medium tabular-nums">
              {formatKES(lineItemTotal(item))}
            </span>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
              aria-label="Remove line"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showWarning && availability && effectivePlan && (
          <StockWarning
            item={item}
            availability={availability}
            plan={effectivePlan}
            onFulfillmentChange={onFulfillmentChange}
          />
        )}
      </div>
    );
  }

return (
  <div className="group border-b border-border/30 py-2 md:py-3 last:border-b-0">
    <div className="space-y-2">
      <div className="flex items-start gap-1.5">
        <div className="min-w-0 flex-1">
          <ProductCombobox
            itemId={item.id}
            productId={item.productId}
            products={products}
            open={comboboxOpen}
            onOpenChange={onComboboxOpenChange}
            onSelect={onProductSelect}
          />
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className="text-[10px] font-medium text-muted-foreground">Total</span>
          <span className="text-xs font-semibold tabular-nums">
            {formatKES(lineItemTotal(item))}
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
          aria-label="Remove line"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Item name */}
      <Input
        value={item.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="Item name"
        className="h-8 border-0 bg-muted/50 text-sm shadow-none focus:ring-1"
      />

      {/* Quantity + Price */}
      <div className="grid grid-cols-2 gap-1.5">
        <div className="space-y-0.5">
          <label className="text-[10px] font-medium text-muted-foreground">Qty</label>
          <Input
            type="number"
            min={1}
            value={String(item.quantity)}
            onChange={(e) =>
              onChange({
                quantity: Math.max(1, Number(e.target.value) || 1),
              })
            }
            className="h-8 border-0 bg-muted/50 text-right text-sm shadow-none focus:ring-1"
          />
        </div>

        <div className="space-y-0.5">
          <label className="text-[10px] font-medium text-muted-foreground">Price</label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={String(item.unitPrice)}
            onChange={(e) =>
              onChange({
                unitPrice: Math.max(0, Number(e.target.value) || 0),
              })
            }
            className="h-8 border-0 bg-muted/50 text-right text-sm shadow-none focus:ring-1"
          />
        </div>
      </div>

      {/* Discount + Tax */}
      <div className="grid grid-cols-2 gap-1.5">
        <div className="space-y-0.5">
          <label className="text-[10px] font-medium text-muted-foreground">Disc %</label>
          <Input
            type="number"
            min={0}
            max={100}
            value={String(item.discount)}
            onChange={(e) =>
              onChange({
                discount: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
              })
            }
            className="h-8 border-0 bg-muted/50 text-right text-sm shadow-none focus:ring-1"
          />
        </div>

        <div className="space-y-0.5">
          <label className="text-[10px] font-medium text-muted-foreground">Tax %</label>
          <Input
            type="number"
            min={0}
            max={100}
            value={String(item.taxRate)}
            onChange={(e) =>
              onChange({
                taxRate: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
              })
            }
            className="h-8 border-0 bg-muted/50 text-right text-sm shadow-none focus:ring-1"
          />
        </div>
      </div>
    </div>

    {/* Stock warning */}
    {showWarning && availability && effectivePlan && (
      <StockWarning
        item={item}
        availability={availability}
        plan={effectivePlan}
        onFulfillmentChange={onFulfillmentChange}
      />
    )}
  </div>
);
}