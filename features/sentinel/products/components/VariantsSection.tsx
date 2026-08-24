"use client";

import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { Info, Plus, Trash2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductFormInput } from "@/lib/validation/product";
import { FieldError } from "./FieldError";

type ProductType = "simple" | "variant";

const EMPTY_VARIANT = {
  sku: "",
  size: "",
  price: 0,
  compareAtPrice: undefined,
  stock: 0,
  reserved: 0,
  image: "",
};

export function VariantsSection() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ProductFormInput>();

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  const variants = useWatch({ control, name: "variants" }) ?? [];
  const productType: ProductType = fields.length > 0 ? "variant" : "simple";

  const rootError =
    (errors.variants as unknown as { message?: string; root?: { message?: string } } | undefined)
      ?.message ??
    (errors.variants as unknown as { root?: { message?: string } } | undefined)?.root?.message;

  const setProductType = (next: ProductType) => {
    if (next === productType) return;
    if (next === "simple") {
      // Dropping back to a simple product clears every variant row — the
      // top-level price/stock fields take back over as the source of truth.
      for (let i = fields.length - 1; i >= 0; i -= 1) remove(i);
    } else {
      append({ ...EMPTY_VARIANT });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product type</CardTitle>
          <CardDescription>
            Switch to variants when this product is sold in different sizes, each with its own
            SKU, price, and stock.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={productType}
            onValueChange={(value) => {
              if (typeof value === "string") setProductType(value as ProductType);
            }}
            className="grid gap-3 sm:grid-cols-2"
          >
            <Label
              htmlFor="product-type-simple"
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-input p-3 has-[[data-checked]]:border-secondary has-[[data-checked]]:bg-secondary/5"
            >
              <RadioGroupItem value="simple" id="product-type-simple" className="mt-1" />
              <span className="flex-1">
                <span className="block text-sm font-medium text-foreground">Simple product</span>
                <span className="block text-xs text-muted-foreground">
                  One price and one stock count for the whole product.
                </span>
              </span>
            </Label>

            <Label
              htmlFor="product-type-variant"
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-input p-3 has-[[data-checked]]:border-secondary has-[[data-checked]]:bg-secondary/5"
            >
              <RadioGroupItem value="variant" id="product-type-variant" className="mt-1" />
              <span className="flex-1">
                <span className="block text-sm font-medium text-foreground">
                  Has variants (sizes)
                </span>
                <span className="block text-xs text-muted-foreground">
                  Each size gets its own SKU, price, compare-at price, and stock.
                </span>
              </span>
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>

      {productType === "variant" && (
        <Card>
          <CardHeader>
            <CardTitle>Variants</CardTitle>
            <CardDescription>
              Add a row for every size this product comes in. Prices, stock and images are set
              per size.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 rounded-lg border border-dashed border-sky-300 bg-sky-50 px-3 py-2 text-xs text-sky-800 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Once this product has variants, the Pricing and Inventory tabs become read-only
                totals — they&apos;re calculated from the rows below.
              </span>
            </div>

            <FieldError message={rootError} />

            {/* Desktop table */}
            <div className="hidden overflow-x-auto rounded-lg border sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[110px]">Size</TableHead>
                    <TableHead className="min-w-[130px]">SKU</TableHead>
                    <TableHead className="min-w-[110px]">Price (KES)</TableHead>
                    <TableHead className="min-w-[130px]">Compare-at</TableHead>
                    <TableHead className="min-w-[90px]">Stock</TableHead>
                    <TableHead className="min-w-[220px]">Image URL</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const rowErrors = errors.variants?.[index];
                    return (
                      <TableRow key={field.id}>
                        <TableCell className="align-top">
                          <Input
                            placeholder="M"
                            aria-invalid={Boolean(rowErrors?.size)}
                            {...register(`variants.${index}.size` as const)}
                          />
                          <FieldError message={rowErrors?.size?.message} />
                        </TableCell>
                        <TableCell className="align-top">
                          <Input
                            placeholder="HLM-BLK-M"
                            aria-invalid={Boolean(rowErrors?.sku)}
                            {...register(`variants.${index}.sku` as const)}
                          />
                          <FieldError message={rowErrors?.sku?.message} />
                        </TableCell>
                        <TableCell className="align-top">
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            inputMode="decimal"
                            aria-invalid={Boolean(rowErrors?.price)}
                            {...register(`variants.${index}.price` as const)}
                          />
                          <FieldError message={rowErrors?.price?.message} />
                        </TableCell>
                        <TableCell className="align-top">
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            inputMode="decimal"
                            placeholder="Optional"
                            aria-invalid={Boolean(rowErrors?.compareAtPrice)}
                            {...register(`variants.${index}.compareAtPrice` as const)}
                          />
                          <FieldError message={rowErrors?.compareAtPrice?.message} />
                        </TableCell>
                        <TableCell className="align-top">
                          <Input
                            type="number"
                            min={0}
                            step="1"
                            inputMode="numeric"
                            aria-invalid={Boolean(rowErrors?.stock)}
                            {...register(`variants.${index}.stock` as const)}
                          />
                          <FieldError message={rowErrors?.stock?.message} />
                        </TableCell>
                        <TableCell className="align-top">
                          <Input
                            placeholder="Optional — falls back to main image"
                            aria-invalid={Boolean(rowErrors?.image)}
                            {...register(`variants.${index}.image` as const)}
                          />
                          <FieldError message={rowErrors?.image?.message} />
                        </TableCell>
                        <TableCell className="align-top">
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="mt-1 text-muted-foreground transition hover:text-destructive"
                            aria-label={`Remove variant ${variants[index]?.size ?? index + 1}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 sm:hidden">
              <AnimatePresence initial={false}>
                {fields.map((field, index) => {
                  const rowErrors = errors.variants?.[index];
                  return (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 rounded-lg border p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Variant {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-muted-foreground transition hover:text-destructive"
                          aria-label={`Remove variant ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>Size</Label>
                          <Input placeholder="M" {...register(`variants.${index}.size` as const)} />
                          <FieldError message={rowErrors?.size?.message} />
                        </div>
                        <div className="space-y-1">
                          <Label>SKU</Label>
                          <Input
                            placeholder="HLM-BLK-M"
                            {...register(`variants.${index}.sku` as const)}
                          />
                          <FieldError message={rowErrors?.sku?.message} />
                        </div>
                        <div className="space-y-1">
                          <Label>Price (KES)</Label>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            {...register(`variants.${index}.price` as const)}
                          />
                          <FieldError message={rowErrors?.price?.message} />
                        </div>
                        <div className="space-y-1">
                          <Label>Compare-at</Label>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder="Optional"
                            {...register(`variants.${index}.compareAtPrice` as const)}
                          />
                          <FieldError message={rowErrors?.compareAtPrice?.message} />
                        </div>
                        <div className="space-y-1">
                          <Label>Stock</Label>
                          <Input
                            type="number"
                            min={0}
                            step="1"
                            {...register(`variants.${index}.stock` as const)}
                          />
                          <FieldError message={rowErrors?.stock?.message} />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <Label>Image URL</Label>
                          <Input
                            placeholder="Optional — falls back to main image"
                            {...register(`variants.${index}.image` as const)}
                          />
                          <FieldError message={rowErrors?.image?.message} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ ...EMPTY_VARIANT })}
            >
              <Plus className="h-4 w-4" />
              Add variant
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default VariantsSection;
