"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

import {
  computeTotals,
  createLineItem,
} from "@/lib/sales";

import { settingsService } from "@/services/sentinel/settings.service";

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

  const [defaultTaxRate, setDefaultTaxRate] =
    useState<number | null>(null);

  /*
   * --------------------------------------------------------------------------
   * Load settings
   * --------------------------------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    settingsService
      .get()
      .then((settings) => {
        if (mounted) {
          setDefaultTaxRate(settings.taxRate);
        }
      })
      .catch(() => {
        // Fall back to createLineItem() default.
      });

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * --------------------------------------------------------------------------
   * Load products
   * --------------------------------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    productService
      .list()
      .then((data) => {
        if (mounted) {
          setProducts(data);
        }
      })
      .catch(() => {
        if (mounted) {
          setProducts([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * --------------------------------------------------------------------------
   * Product availability
   * --------------------------------------------------------------------------
   */

  const productIdsKey = useMemo(() => {
    if (!stockAware) return "";

    return Array.from(
      new Set(
        items
          .filter((item) => item.productId)
          .map(
            (item) =>
              `${item.productId}:${item.variantSku ?? ""}`
          )
      )
    )
      .sort()
      .join(",");
  }, [items, stockAware]);

  useEffect(() => {
    if (!stockAware || !productIdsKey) {
      setAvailability(new Map());
      return;
    }

    let mounted = true;

    const pairs = productIdsKey.split(",").map((pair) => {
      const separatorIndex = pair.indexOf(":");

      if (separatorIndex === -1) {
        return {
          productId: pair,
          variantSku: undefined,
        };
      }

      const productId = pair.slice(0, separatorIndex);
      const variantSku = pair.slice(separatorIndex + 1);

      return {
        productId,
        variantSku: variantSku || undefined,
      };
    });

    productService
      .getAvailability(pairs)
      .then((data) => {
        if (mounted) {
          setAvailability(data);
        }
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

  /*
   * --------------------------------------------------------------------------
   * Line item helpers
   * --------------------------------------------------------------------------
   *
   * IMPORTANT:
   * We deliberately use the ARRAY INDEX for mutations.
   *
   * `item.id` comes from persisted invoice data and may be missing or
   * duplicated in older records. Using the ID to update/remove an item can
   * therefore modify multiple rows at once.
   *
   * The index is guaranteed to identify exactly one row in the current array.
   */

  const updateItem = (
    index: number,
    patch: Partial<LineItem>
  ) => {
    onChange(
      items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              ...patch,
            }
          : item
      )
    );
  };

  const removeItem = (index: number) => {
    onChange(
      items.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );

    // Close the combobox if the removed row had it open.
    setOpenCombobox(null);
  };

  const addItem = () => {
    onChange([
      ...items,
      createLineItem(
        {},
        defaultTaxRate ?? undefined
      ),
    ]);
  };

  /*
   * --------------------------------------------------------------------------
   * Product selection
   * --------------------------------------------------------------------------
   */

  const applyProduct = (
    index: number,
    productId: string
  ) => {
    if (productId === "custom") {
      updateItem(index, {
        productId: undefined,
        variantSku: undefined,
        size: undefined,
      });

      setOpenCombobox(null);
      return;
    }

    const product = products.find(
      (p) => p.id === productId
    );

    if (!product) return;

    updateItem(index, {
      productId,
      name: product.name,
      description: product.description,
      unitPrice: product.price,

      // A new product selection must clear the previous
      // product's variant information.
      variantSku: undefined,
      size: undefined,
    });

    setOpenCombobox(null);
  };

  /*
   * --------------------------------------------------------------------------
   * Totals
   * --------------------------------------------------------------------------
   */

  const totals = computeTotals(items);

  /*
   * --------------------------------------------------------------------------
   * Render
   * --------------------------------------------------------------------------
   */

  return (
    <div className="flex max-h-[60vh] min-h-[250px] flex-col rounded-xl border border-border/60 bg-white shadow-sm dark:bg-gray-950">
      {/* Header */}
      {items.length > 0 && (
        <div className="grid shrink-0 grid-cols-12 gap-2 border-b border-border/40 px-4 py-2 text-xs font-medium text-muted-foreground">
          <div className="col-span-4">
            Item
          </div>

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
          items.map((item, index) => {
            /*
             * React keys must ALWAYS be unique.
             *
             * Existing invoice records may contain duplicate/missing IDs,
             * so item.id alone is not safe.
             *
             * Combining the ID with the current index guarantees uniqueness
             * even when:
             *
             *   - item.id === undefined
             *   - item.id === ""
             *   - two database records have the same ID
             */
            const rowKey = `${item.id || "line-item"}-${index}`;

            return (
              <LineItemRow
                key={rowKey}
                item={item}
                products={products}
                availability={
                  item.productId
                    ? availability.get(
                        item.productId
                      )
                    : undefined
                }
                stockAware={stockAware}
                comboboxOpen={
                  openCombobox === rowKey
                }
                onComboboxOpenChange={(open) =>
                  setOpenCombobox(
                    open ? rowKey : null
                  )
                }
                onProductSelect={(productId) =>
                  applyProduct(
                    index,
                    productId
                  )
                }
                onChange={(patch) =>
                  updateItem(
                    index,
                    patch
                  )
                }
                onRemove={() =>
                  removeItem(index)
                }
                onFulfillmentChange={(plan) =>
                  updateItem(index, {
                    fulfillmentPlan: plan,
                  })
                }
              />
            );
          })
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