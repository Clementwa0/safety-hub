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
import { productService } from "@/services/shared/product.service";
import type { Product } from "@/types/product";
import type { LineItem } from "@/types/sentinel/sales";

interface LineItemsEditorProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  error?: string;
}

export function LineItemsEditor({ items, onChange, error }: LineItemsEditorProps) {
  // Previously this read `useAdminStore((state) => state.products)`, a
  // localStorage-only mock store seeded from `data/products.ts`. That meant
  // the "add product" picker offered demo products that don't exist in the
  // real database, so selecting one attached a productId with no matching
  // MongoDB record. Load real products from the API instead.
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    void productService
      .list()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

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

        {items.map((item, index) => (
          <div
            key={item.id}
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
        ))}
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
