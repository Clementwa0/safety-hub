"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import {
  computeTotals,
  createLineItem,
} from "@/lib/sales";

import {
  productService,
  type ProductAvailability,
} from "@/services/shared/product.service";

import type { Product } from "@/types/product";
import type { LineItem } from "@/types/sentinel/sales";
import { LineItemRow } from "./lineitem/LineItemRow";
import { LineItemsSummary } from "./lineitem/LineItemsSummary";


interface LineItemsEditorProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  error?: string;
  stockAware?: boolean;
}

export default function LineItemsEditor({
  items,
  onChange,
  error,
  stockAware = false,
}: LineItemsEditorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [availability, setAvailability] =
    useState<Map<string, ProductAvailability>>(new Map());

  const [openCombobox, setOpenCombobox] =
    useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    productService
      .list()
      .then((data) => {
        if (mounted) setProducts(data);
      })
      .catch(() => {
        if (mounted) setProducts([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const productIdsKey = stockAware
    ? Array.from(
        new Set(
          items
            .map((item) => item.productId)
            .filter(Boolean)
        )
      )
        .sort()
        .join(",")
    : "";

  useEffect(() => {
    if (!stockAware || !productIdsKey) {
      setAvailability(new Map());
      return;
    }

    let mounted = true;

    productService
      .getAvailability(productIdsKey.split(","))
      .then((data) => {
        if (mounted) setAvailability(data);
      })
      .catch(() => {
        if (mounted) {
          setAvailability(new Map());
        }
      });

    return () => {
      mounted = false;
    };
  }, [stockAware, productIdsKey]);

  const updateItem = (
    id: string,
    patch: Partial<LineItem>
  ) => {
    onChange(
      items.map((item) =>
        item.id === id
          ? { ...item, ...patch }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    onChange(
      items.filter((item) => item.id !== id)
    );
  };

  const addItem = () => {
    onChange([...items, createLineItem()]);
  };

  const applyProduct = (
    id: string,
    productId: string
  ) => {
    if (productId === "custom") {
      updateItem(id, {
        productId: undefined,
      });

      setOpenCombobox(null);
      return;
    }

    const product = products.find(
      (p) => p.id === productId
    );

    if (!product) return;

    updateItem(id, {
      productId,
      name: product.name,
      description: product.description,
      unitPrice: product.price,
    });

    setOpenCombobox(null);
  };

  const totals = computeTotals(items);

  return (
    <div className="flex max-h-[60vh] min-h-[250px] flex-col rounded-xl border border-border/60 bg-white shadow-sm dark:bg-gray-950">
      {/* Header */}
      {items.length > 0 && (
        <div className="grid shrink-0 grid-cols-12 gap-2 border-b border-border/40 px-4 py-2 text-xs font-medium text-muted-foreground">
          <div className="col-span-4">Item</div>
          <div className="col-span-2 text-right">
            Qty
          </div>
          <div className="col-span-2 text-right">
            Price
          </div>
          <div className="col-span-1 text-right">
            Disc %
          </div>
          <div className="col-span-1 text-right">
            Tax %
          </div>
          <div className="col-span-2 text-right">
            Total
          </div>
        </div>
      )}

      {/* Rows */}
      <div className="flex-1 divide-y divide-border/30 overflow-y-auto px-4">
        {items.length === 0 ? (
          <div className="flex h-full min-h-[120px] items-center justify-center py-8 text-center text-sm text-muted-foreground">
            No line items yet.

            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={addItem}
              className="ml-1 h-auto p-0 text-sm"
            >
              Add one
            </Button>
          </div>
        ) : (
          items.map((item) => (
            <LineItemRow
              key={item.id}
              item={item}
              products={products}
              availability={
                item.productId
                  ? availability.get(item.productId)
                  : undefined
              }
              stockAware={stockAware}
              comboboxOpen={
                openCombobox === item.id
              }
              onComboboxOpenChange={(open) =>
                setOpenCombobox(
                  open ? item.id : null
                )
              }
              onProductSelect={(productId) =>
                applyProduct(
                  item.id,
                  productId
                )
              }
              onChange={(patch) =>
                updateItem(item.id, patch)
              }
              onRemove={() =>
                removeItem(item.id)
              }
              onFulfillmentChange={(plan) =>
                updateItem(item.id, {
                  fulfillmentPlan: plan,
                })
              }
            />
          ))
        )}
      </div>

      {/* Footer */}
      <LineItemsSummary
        totals={totals}
        onAddItem={addItem}
        error={error}
      />
    </div>
  );
}