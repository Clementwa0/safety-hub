"use client";

import { useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingDown } from "lucide-react";

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
import type { ProductFormInput } from "@/lib/schemas/product";
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
    compareAtPriceRaw === undefined || compareAtPriceRaw === null || Number.isNaN(Number(compareAtPriceRaw))
      ? undefined
      : Number(compareAtPriceRaw);

  const discount = getDiscountPercent(price, compareAtPrice);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
        <CardDescription>
          Set the selling price and, optionally, an original price to show a discount.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Selling price (KES)</Label>
            <Input
              id="price"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              aria-invalid={Boolean(errors.price)}
              {...register("price")}
            />
            <FieldError message={errors.price?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="compareAtPrice">Original / compare-at price (KES)</Label>
            <Input
              id="compareAtPrice"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              placeholder="Optional"
              aria-invalid={Boolean(errors.compareAtPrice)}
              {...register("compareAtPrice")}
            />
            <FieldError message={errors.compareAtPrice?.message} />
          </div>
        </div>

        <AnimatePresence>
          {discount !== null ? (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-emerald-300 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/30"
            >
              <Badge variant="destructive" className="gap-1 text-sm">
                <TrendingDown className="h-3.5 w-3.5" />
                -{discount}% OFF
              </Badge>
              <span className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{formatKES(price)}</span>
                {" "}
                <span className="line-through">{formatKES(compareAtPrice ?? 0)}</span>
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default PricingSection;
