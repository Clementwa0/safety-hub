"use client";

import { useFormContext } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { TrendingDown, Tag } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { formatKES } from "@/lib/format";
import { getDiscountPercent } from "@/types/product";
import type { ProductFormInput } from "@/lib/validation/product";
import { FieldError } from "./FieldError";

export function PricingSection() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<ProductFormInput>();

  const price = Number(watch("price")) || 0;

  const compareAtPriceRaw = watch("compareAtPrice");

  const compareAtPrice =
    compareAtPriceRaw === undefined ||
    compareAtPriceRaw === null ||
    Number.isNaN(Number(compareAtPriceRaw))
      ? undefined
      : Number(compareAtPriceRaw);

  const discount = getDiscountPercent(price, compareAtPrice);

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <CardHeader className="space-y-1 border-b px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
          </div>

          <CardTitle className="text-sm font-semibold">
            Pricing
          </CardTitle>
        </div>

        <CardDescription className="text-xs">
          Set the selling price and an optional original price for discounts.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 px-4 py-4 sm:px-5">
        {/* Prices */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Selling price */}
          <div className="space-y-1.5">
            <Label
              htmlFor="price"
              className="text-xs font-medium"
            >
              Selling price
            </Label>

            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                KES
              </span>

              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                placeholder="0.00"
                className="h-9 pl-12 text-sm"
                aria-invalid={Boolean(errors.price)}
                {...register("price")}
              />
            </div>

            <FieldError message={errors.price?.message} />
          </div>

          {/* Compare-at */}
          <div className="space-y-1.5">
            <Label
              htmlFor="compareAtPrice"
              className="text-xs font-medium"
            >
              Original price
              <span className="ml-1 font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>

            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                KES
              </span>

              <Input
                id="compareAtPrice"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                placeholder="0.00"
                className="h-9 pl-12 text-sm"
                aria-invalid={Boolean(errors.compareAtPrice)}
                {...register("compareAtPrice")}
              />
            </div>

            <FieldError
              message={errors.compareAtPrice?.message}
            />
          </div>
        </div>

        {/* Discount preview */}
        <AnimatePresence initial={false}>
          {discount !== null ? (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
                y: -4,
              }}
              animate={{
                opacity: 1,
                height: "auto",
                y: 0,
              }}
              exit={{
                opacity: 0,
                height: 0,
                y: -4,
              }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between gap-3 rounded-md border border-dashed bg-muted/30 px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2">

                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">
                      Customer discount
                    </p>

                    <p className="truncate text-xs font-medium">
                      {formatKES(price)}
                      <span className="mx-1.5 text-muted-foreground">
                        vs
                      </span>
                      <span className="text-muted-foreground  text-xs line-through">
                        {formatKES(compareAtPrice ?? 0)}
                      </span>
                    </p>
                  </div>
                </div>

                <Badge
                  variant="destructive"
                  className="shrink-0 gap-1 border-0 px-2 py-1 text-[11px] text-emerald-100 dark:text-emerald-400"
                >
                  <TrendingDown className="h-3 w-3" />
                  {discount}% OFF
                </Badge>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Helper text */}
        <p className="text-[10px] leading-4 text-muted-foreground">
          The selling price is what customers pay. Add an original price
          only when you want to display a discount.
        </p>
      </CardContent>
    </Card>
  );
}

export default PricingSection;