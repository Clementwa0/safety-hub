"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { Info, Plus, Trash2, Package, Layers3 } from "lucide-react";

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
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const variants = useWatch({
    control,
    name: "variants",
  }) ?? [];

  const productType: ProductType =
    fields.length > 0 ? "variant" : "simple";

  const rootError =
    (
      errors.variants as unknown as {
        message?: string;
        root?: { message?: string };
      } | undefined
    )?.message ??
    (
      errors.variants as unknown as {
        root?: { message?: string };
      } | undefined
    )?.root?.message;

  const setProductType = (next: ProductType) => {
    if (next === productType) return;

    if (next === "simple") {
      for (let i = fields.length - 1; i >= 0; i -= 1) {
        remove(i);
      }
    } else {
      append({ ...EMPTY_VARIANT });
    }
  };

  return (
    <div className="space-y-4">
      {/* Product type */}
      <Card className="overflow-hidden">
        <CardHeader className="space-y-1 border-b px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
            </div>

            <CardTitle className="text-sm font-semibold">
              Product type
            </CardTitle>
          </div>

          <CardDescription className="text-xs">
            Choose whether the product has one stock/price or multiple
            size-based variants.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 py-4 sm:px-5">
          <RadioGroup
            value={productType}
            onValueChange={(value) => {
              if (typeof value === "string") {
                setProductType(value as ProductType);
              }
            }}
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          >
            {/* Simple */}
            <Label
              htmlFor="product-type-simple"
              className="flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors hover:bg-muted/40 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
            >
              <RadioGroupItem
                id="product-type-simple"
                value="simple"
              />

              <div className="min-w-0">
                <p className="text-xs font-medium">
                  Simple product
                </p>

                <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
                  One price and stock count.
                </p>
              </div>
            </Label>

            {/* Variants */}
            <Label
              htmlFor="product-type-variant"
              className="flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors hover:bg-muted/40 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
            >
              <RadioGroupItem
                id="product-type-variant"
                value="variant"
              />

              <div className="min-w-0">
                <p className="text-xs font-medium">
                  Has variants
                </p>

                <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
                  Separate SKU, price and stock per size.
                </p>
              </div>
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Variants */}
      {productType === "variant" && (
        <Card className="overflow-hidden">
          <CardHeader className="space-y-1 border-b px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                <Layers3 className="h-3.5 w-3.5 text-muted-foreground" />
              </div>

              <CardTitle className="text-sm font-semibold">
                Variants
              </CardTitle>
            </div>

            <CardDescription className="text-xs">
              Add each size with its own SKU, price, stock and optional image.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 px-4 py-4 sm:px-5">
            {/* Info */}
            <div className="flex items-start gap-2 rounded-md border border-dashed bg-muted/30 px-3 py-2.5">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />

              <p className="text-[11px] leading-4 text-muted-foreground">
                Pricing and inventory totals are calculated automatically
                from the variants below.
              </p>
            </div>

            <FieldError message={rootError} />

            {/* Desktop table */}
            <div className="hidden overflow-x-auto rounded-md border md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="h-9 min-w-[100px] text-xs">
                      Size
                    </TableHead>

                    <TableHead className="h-9 min-w-[130px] text-xs">
                      SKU
                    </TableHead>

                    <TableHead className="h-9 min-w-[110px] text-xs">
                      Price
                    </TableHead>

                    <TableHead className="h-9 min-w-[120px] text-xs">
                      Compare-at
                    </TableHead>

                    <TableHead className="h-9 min-w-[90px] text-xs">
                      Stock
                    </TableHead>

                    <TableHead className="h-9 min-w-[220px] text-xs">
                      Image URL
                    </TableHead>

                    <TableHead className="h-9 w-10" />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {fields.map((field, index) => {
                    const rowErrors = errors.variants?.[index];

                    return (
                      <TableRow key={field.id}>
                        {/* Size */}
                        <TableCell className="align-top p-2">
                          <Input
                            placeholder="M"
                            className="h-8 text-xs"
                            aria-invalid={Boolean(rowErrors?.size)}
                            {...register(
                              `variants.${index}.size` as const,
                            )}
                          />

                          <FieldError
                            message={rowErrors?.size?.message}
                          />
                        </TableCell>

                        {/* SKU */}
                        <TableCell className="align-top p-2">
                          <Input
                            placeholder="HLM-BLK-M"
                            className="h-8 text-xs"
                            aria-invalid={Boolean(rowErrors?.sku)}
                            {...register(
                              `variants.${index}.sku` as const,
                            )}
                          />

                          <FieldError
                            message={rowErrors?.sku?.message}
                          />
                        </TableCell>

                        {/* Price */}
                        <TableCell className="align-top p-2">
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            inputMode="decimal"
                            className="h-8 text-xs"
                            aria-invalid={Boolean(rowErrors?.price)}
                            {...register(
                              `variants.${index}.price` as const,
                            )}
                          />

                          <FieldError
                            message={rowErrors?.price?.message}
                          />
                        </TableCell>

                        {/* Compare */}
                        <TableCell className="align-top p-2">
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            inputMode="decimal"
                            placeholder="Optional"
                            className="h-8 text-xs"
                            aria-invalid={Boolean(
                              rowErrors?.compareAtPrice,
                            )}
                            {...register(
                              `variants.${index}.compareAtPrice` as const,
                            )}
                          />

                          <FieldError
                            message={
                              rowErrors?.compareAtPrice?.message
                            }
                          />
                        </TableCell>

                        {/* Stock */}
                        <TableCell className="align-top p-2">
                          <Input
                            type="number"
                            min={0}
                            step="1"
                            inputMode="numeric"
                            className="h-8 text-xs"
                            aria-invalid={Boolean(rowErrors?.stock)}
                            {...register(
                              `variants.${index}.stock` as const,
                            )}
                          />

                          <FieldError
                            message={rowErrors?.stock?.message}
                          />
                        </TableCell>

                        {/* Image */}
                        <TableCell className="align-top p-2">
                          <Input
                            placeholder="Optional image URL"
                            className="h-8 text-xs"
                            aria-invalid={Boolean(rowErrors?.image)}
                            {...register(
                              `variants.${index}.image` as const,
                            )}
                          />

                          <FieldError
                            message={rowErrors?.image?.message}
                          />
                        </TableCell>

                        {/* Delete */}
                        <TableCell className="align-top p-2">
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="mt-1 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Remove variant ${
                              variants[index]?.size ?? index + 1
                            }`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile variants */}
            <div className="space-y-2 md:hidden">
              <AnimatePresence initial={false}>
                {fields.map((field, index) => {
                  const rowErrors = errors.variants?.[index];

                  return (
                    <motion.div
                      key={field.id}
                      initial={{
                        opacity: 0,
                        height: 0,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                      }}
                      className="overflow-hidden rounded-md border"
                    >
                      {/* Variant header */}
                      <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2">
                        <span className="text-xs font-medium">
                          Variant {index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-red-500 transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Remove variant ${index + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Fields */}
                      <div className="grid grid-cols-2 gap-2 p-3">
                        <div className="space-y-1">
                          <Label className="text-[11px]">
                            Size
                          </Label>

                          <Input
                            placeholder="M"
                            className="h-8 text-xs"
                            {...register(
                              `variants.${index}.size` as const,
                            )}
                          />

                          <FieldError
                            message={rowErrors?.size?.message}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px]">
                            SKU
                          </Label>

                          <Input
                            placeholder="HLM-BLK-M"
                            className="h-8 text-xs"
                            {...register(
                              `variants.${index}.sku` as const,
                            )}
                          />

                          <FieldError
                            message={rowErrors?.sku?.message}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px]">
                            Price
                          </Label>

                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            inputMode="decimal"
                            className="h-8 text-xs"
                            {...register(
                              `variants.${index}.price` as const,
                            )}
                          />

                          <FieldError
                            message={rowErrors?.price?.message}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px]">
                            Compare-at
                          </Label>

                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            inputMode="decimal"
                            placeholder="Optional"
                            className="h-8 text-xs"
                            {...register(
                              `variants.${index}.compareAtPrice` as const,
                            )}
                          />

                          <FieldError
                            message={
                              rowErrors?.compareAtPrice?.message
                            }
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px]">
                            Stock
                          </Label>

                          <Input
                            type="number"
                            min={0}
                            step="1"
                            inputMode="numeric"
                            className="h-8 text-xs"
                            {...register(
                              `variants.${index}.stock` as const,
                            )}
                          />

                          <FieldError
                            message={rowErrors?.stock?.message}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px]">
                            Image URL
                          </Label>

                          <Input
                            placeholder="Optional"
                            className="h-8 text-xs"
                            {...register(
                              `variants.${index}.image` as const,
                            )}
                          />

                          <FieldError
                            message={rowErrors?.image?.message}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Add */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ ...EMPTY_VARIANT })}
              className="h-8 w-full gap-1.5 text-xs sm:w-auto"
            >
              <Plus className="h-3.5 w-3.5" />
              Add variant
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default VariantsSection;