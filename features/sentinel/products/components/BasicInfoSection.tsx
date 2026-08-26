"use client";

import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";

import { categoryService } from "@/services/shared/category.service";
import type { CategoryWithCount } from "@/types/category";
import type { ProductFormInput } from "@/lib/validation/product";

import { FieldError } from "./FieldError";

export function BasicInfoSection() {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProductFormInput>();

  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        const items = await categoryService.list();

        if (mounted) {
          setCategories(items);
        }
      } catch {
        if (mounted) {
          setCategories([]);
        }
      } finally {
        if (mounted) {
          setLoadingCategories(false);
        }
      }
    };

    void loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedCategoryName = watch("category");

  const selectedCategory = categories.find(
    (category) => category.name === selectedCategoryName,
  );

  const subcategoryOptions = selectedCategory?.subcategories ?? [];

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <CardHeader className="space-y-1 border-b px-4 py-3 sm:px-5 sm:py-4">
        <CardTitle className="text-sm font-semibold">
          Basic information
        </CardTitle>

        <CardDescription className="text-xs">
          Product name, description and catalogue classification.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        {/* Product name */}
        <div className="space-y-1.5">
          <Label
            htmlFor="name"
            className="text-xs font-medium"
          >
            Product name
          </Label>

          <Input
            id="name"
            placeholder="Industrial Safety Helmet"
            className="h-9 text-sm"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />

          <FieldError message={errors.name?.message} />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="description"
              className="text-xs font-medium"
            >
              Description
            </Label>

            <span className="text-[10px] text-muted-foreground">
              Customer-facing
            </span>
          </div>

          <Textarea
            id="description"
            rows={3}
            placeholder="Certified protection with a 6-point suspension harness..."
            className="min-h-[80px] resize-y text-sm"
            aria-invalid={Boolean(errors.description)}
            {...register("description")}
          />

          <FieldError message={errors.description?.message} />
        </div>

        {/* Category / Subcategory */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Category */}
          <div className="space-y-1.5">
            <Label
              htmlFor="category"
              className="text-xs font-medium"
            >
              Category
            </Label>

            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={(value) => {
                    if (typeof value !== "string") return;

                    field.onChange(value);

                    // Reset subcategory when category changes.
                    setValue("subcategory", "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                >
                  <SelectTrigger
                    id="category"
                    className="h-9 w-full text-sm"
                    aria-invalid={Boolean(errors.category)}
                  >
                    <SelectValue
                      placeholder={
                        loadingCategories
                          ? "Loading categories..."
                          : "Select category"
                      }
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.name}
                        >
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">
                        {loadingCategories
                          ? "Loading categories..."
                          : "No categories found"}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              )}
            />

            <FieldError message={errors.category?.message} />
          </div>

          {/* Subcategory */}
          <div className="space-y-1.5">
            <Label
              htmlFor="subcategory"
              className="text-xs font-medium"
            >
              Subcategory
            </Label>

            {subcategoryOptions.length > 0 ? (
              <Controller
                control={control}
                name="subcategory"
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
                      id="subcategory"
                      className="h-9 w-full text-sm"
                      aria-invalid={Boolean(errors.subcategory)}
                    >
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>

                    <SelectContent>
                      {subcategoryOptions.map((subcategory) => (
                        <SelectItem
                          key={subcategory}
                          value={subcategory}
                        >
                          {subcategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            ) : (
              <Input
                id="subcategory"
                placeholder={
                  selectedCategoryName
                    ? "Enter subcategory"
                    : "Select category first"
                }
                disabled={!selectedCategoryName}
                className="h-9 text-sm"
                aria-invalid={Boolean(errors.subcategory)}
                {...register("subcategory")}
              />
            )}

            <FieldError message={errors.subcategory?.message} />
          </div>
        </div>

        {/* Brand / SKU */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Brand */}
          <div className="space-y-1.5">
            <Label
              htmlFor="brand"
              className="text-xs font-medium"
            >
              Brand
            </Label>

            <Input
              id="brand"
              placeholder="3M, Honeywell, MSA..."
              className="h-9 text-sm"
              aria-invalid={Boolean(errors.brand)}
              {...register("brand")}
            />

            <FieldError message={errors.brand?.message} />
          </div>

          {/* SKU */}
          <div className="space-y-1.5">
            <Label
              htmlFor="sku"
              className="text-xs font-medium"
            >
              SKU
            </Label>

            <Input
              id="sku"
              placeholder="HSE-HEL-0012"
              className="h-9 font-mono text-sm"
              aria-invalid={Boolean(errors.sku)}
              {...register("sku")}
            />

            <FieldError message={errors.sku?.message} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BasicInfoSection;