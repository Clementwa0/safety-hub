"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Package, Radio } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import {
  PRODUCT_STATUSES,
  PRODUCT_STATUS_LABELS,
} from "@/types/product";
import type { ProductFormInput } from "@/lib/validation/product";

import { FieldError } from "./FieldError";

export function InventorySection() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ProductFormInput>();

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <CardHeader className="px-4 py-3 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted/40">
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold">
              Inventory
            </CardTitle>

            <CardDescription className="mt-0.5 text-xs leading-relaxed">
              Manage stock availability and catalogue status.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="px-4 py-4 sm:px-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Stock */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />

              <Label
                htmlFor="stock"
                className="text-xs font-medium"
              >
                Stock quantity
              </Label>
            </div>

            <Input
              id="stock"
              type="number"
              min={0}
              step="1"
              inputMode="numeric"
              placeholder="0"
              className="h-9 text-sm"
              aria-invalid={Boolean(errors.stock)}
              {...register("stock")}
            />

            <p className="text-[10px] text-muted-foreground">
              Number of units currently available.
            </p>

            <FieldError message={errors.stock?.message} />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-muted-foreground" />

              <Label
                htmlFor="status"
                className="text-xs font-medium"
              >
                Product status
              </Label>
            </div>

            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={(value) => {
                    if (typeof value === "string") {
                      field.onChange(value);
                    }
                  }}
                >
                  <SelectTrigger
                    id="status"
                    className="h-9 w-full text-sm"
                    aria-invalid={Boolean(errors.status)}
                  >
                    <SelectValue placeholder="Select status">
                      {field.value
                        ? PRODUCT_STATUS_LABELS[field.value]
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {PRODUCT_STATUSES.map((status) => (
                      <SelectItem
                        key={status}
                        value={status}
                      >
                        {PRODUCT_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            <p className="text-[10px] text-muted-foreground">
              Controls whether the product is available in the catalogue.
            </p>

            <FieldError message={errors.status?.message} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default InventorySection;