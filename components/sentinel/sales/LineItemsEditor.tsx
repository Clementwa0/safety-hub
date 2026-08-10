"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatKES } from "@/lib/format";
import { computeTotals, createLineItem, lineItemTotal } from "@/lib/sales";
import { productService, type ProductAvailability } from "@/services/shared/product.service";
import type { Product } from "@/types/product";
import type { LineItem } from "@/types/sentinel/sales";
import { FulfillmentBadge } from "@/components/sentinel/sales/FulfillmentBadge";

interface LineItemsEditorProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  error?: string;
  // Shows live stock availability per line and lets staff pick a
  // fulfillment plan ("available now" / "needs procurement") when a
  // requested quantity exceeds what's on hand. Only meaningful for
  // Quotations - Invoices and Orders reuse this same editor but don't
  // carry a fulfillmentPlan/availableAtQuote concept, so they omit this.
  stockAware?: boolean;
}

function planFor(requested: number, available: number): LineItem["fulfillmentPlan"] {
  if (available >= requested) return "available";
  if (available > 0) return "partial";
  return "procurement";
}

export function LineItemsEditor({ items, onChange, error, stockAware = false }: LineItemsEditorProps) {
  // Previously this read `useAdminStore((state) => state.products)`, a
  // localStorage-only mock store seeded from `data/products.ts`. That meant
  // the "add product" picker offered demo products that don't exist in the
  // real database, so selecting one attached a productId with no matching
  // MongoDB record. Load real products from the API instead.
  const [products, setProducts] = useState<Product[]>([]);
  const [availability, setAvailability] = useState<Map<string, ProductAvailability>>(new Map());

  useEffect(() => {
    void productService
      .list()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  // Refetch availability whenever the set of product ids referenced by
  // the line items changes (not on every quantity keystroke - the
  // per-line plan is recomputed locally from this cached map, so there's
  // no need to hit the API again just because a quantity changed).
  const productIdsKey = stockAware
    ? Array.from(new Set(items.map((item) => item.productId).filter(Boolean))).sort().join(",")
    : "";

  useEffect(() => {
    if (!stockAware || !productIdsKey) {
      setAvailability(new Map());
      return;
    }
    void productService
      .getAvailability(productIdsKey.split(","))
      .then(setAvailability)
      .catch(() => setAvailability(new Map()));
  }, [stockAware, productIdsKey]);

  const totals = computeTotals(items);

  const updateItem = (id: string, patch: Partial<LineItem>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const addItem = () => {
    onChange([...items, createLineItem()]);
  };

  const applyProduct = (id: string, productId: string) => {
    if (productId === "custom") {
      updateItem(id, { productId: undefined });
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    updateItem(id, {
      productId,
      name: product.name,
      description: product.description,
      unitPrice: product.price,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No line items yet. Add one below.
          </p>
        ) : null}

        {items.map((item, index) => {
          const entry = item.productId ? availability.get(item.productId) : undefined;
          const plan = stockAware && entry ? planFor(item.quantity, entry.available) : undefined;
          const effectivePlan = item.fulfillmentPlan ?? plan;
          const showWarning = stockAware && entry && plan && plan !== "available";

          return (
          <div key={item.id} className="space-y-2">
          <div
            className="grid gap-3 rounded-lg border border-border bg-muted/20 p-3 md:grid-cols-12"
          >
            <div className="space-y-1 md:col-span-4">
              <Label className="text-xs">Product #{index + 1}</Label>
              <Select
                value={item.productId ?? "custom"}
                onValueChange={(value) => {
                  if (typeof value === "string") applyProduct(item.id, value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom item</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={item.name}
                onChange={(e) => updateItem(item.id, { name: e.target.value })}
                placeholder="Item name"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs">Qty</Label>
              <Input
                type="number"
                min={1}
                value={String(item.quantity)}
                onChange={(e) =>
                  updateItem(item.id, {
                    quantity: Math.max(1, Number(e.target.value) || 1),
                  })
                }
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs">Unit price</Label>
              <Input
                type="number"
                min={0}
                value={String(item.unitPrice)}
                onChange={(e) =>
                  updateItem(item.id, {
                    unitPrice: Math.max(0, Number(e.target.value) || 0),
                  })
                }
              />
            </div>

            <div className="space-y-1 md:col-span-1">
              <Label className="text-xs">Disc %</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={String(item.discount)}
                onChange={(e) =>
                  updateItem(item.id, {
                    discount: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                  })
                }
              />
            </div>

            <div className="space-y-1 md:col-span-1">
              <Label className="text-xs">Tax %</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={String(item.taxRate)}
                onChange={(e) =>
                  updateItem(item.id, {
                    taxRate: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                  })
                }
              />
            </div>

            <div className="flex items-end justify-between gap-2 md:col-span-2">
              <div>
                <Label className="text-xs">Total</Label>
                <p className="pt-2 text-sm font-medium">
                  {formatKES(lineItemTotal(item))}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove line"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          {showWarning ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs">
              <span>
                {Math.max(0, item.quantity - (entry?.available ?? 0))} of {item.quantity} unit
                {item.quantity === 1 ? "" : "s"} exceed{item.quantity === 1 ? "s" : ""} available
                stock ({entry?.available ?? 0} on hand).
              </span>
              <div className="flex items-center gap-2">
                <FulfillmentBadge plan={effectivePlan} />
                <Select
                  value={item.fulfillmentPlan ?? plan}
                  onValueChange={(value) => {
                    if (typeof value === "string") {
                      updateItem(item.id, {
                        fulfillmentPlan: value as LineItem["fulfillmentPlan"],
                      });
                    }
                  }}
                >
                  <SelectTrigger className="h-7 w-[180px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partial">Partial - ship what's on hand</SelectItem>
                    <SelectItem value="procurement">Procurement required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}
          </div>
          );
        })}
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" onClick={addItem}>
          <Plus className="h-4 w-4" />
          Add line item
        </Button>

        <div className="grid gap-1 text-sm sm:min-w-[240px]">
          <Row label="Subtotal" value={formatKES(totals.subtotal)} />
          <Row label="Discount" value={`- ${formatKES(totals.discount)}`} />
          <Row label="Tax" value={formatKES(totals.tax)} />
          <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
            <span className="font-medium">Total</span>
            <span className="font-semibold">{formatKES(totals.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default LineItemsEditor;
