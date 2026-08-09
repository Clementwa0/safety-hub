"use client";

import { Controller, useFormContext } from "react-hook-form";

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
import { PRODUCT_STATUSES, PRODUCT_STATUS_LABELS } from "@/types/product";
import type { ProductFormInput } from "@/lib/validation/product";
import { FieldError } from "./FieldError";

export function InventorySection() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ProductFormInput>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory</CardTitle>
        <CardDescription>Stock on hand and the product's publishing status.</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="stock">Stock quantity</Label>
          <Input
            id="stock"
            type="number"
            min={0}
            step="1"
            inputMode="numeric"
            aria-invalid={Boolean(errors.stock)}
            {...register("stock")}
          />
          <FieldError message={errors.stock?.message} />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  if (typeof value === "string") field.onChange(value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status">
                    {field.value ? PRODUCT_STATUS_LABELS[field.value] : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {PRODUCT_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.status?.message} />
        </div>
      </CardContent>
    </Card>
  );
}

export default InventorySection;
