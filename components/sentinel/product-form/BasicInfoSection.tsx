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
    void categoryService
      .list()
      .then((items) => setCategories(items))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));
  }, []);

  const selectedCategoryName = watch("category");
  const selectedCategory = categories.find((item) => item.name === selectedCategoryName);
  const subcategoryOptions = selectedCategory?.subcategories ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic information</CardTitle>
        <CardDescription>
          The name, description and classification shown to customers.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Product name</Label>
          <Input
            id="name"
            placeholder="Industrial Safety Helmet"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={6}
            placeholder="Certified protection with a 6-point suspension harness..."
            aria-invalid={Boolean(errors.description)}
            {...register("description")}
          />
          <FieldError message={errors.description?.message} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    if (typeof value === "string") {
                      field.onChange(value);
                      // Category changed — the previous subcategory almost
                      // certainly doesn't belong to the new category.
                      setValue("subcategory", "");
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={loadingCategories ? "Loading..." : "Select category"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.category?.message} />
          </div>

          <div className="space-y-2">
            <Label>Subcategory</Label>
            {subcategoryOptions.length > 0 ? (
              <Controller
                control={control}
                name="subcategory"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={(value) => {
                      if (typeof value === "string") field.onChange(value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategoryOptions.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            ) : (
              <Input
                placeholder={
                  selectedCategoryName
                    ? "Hard Hats (optional)"
                    : "Select a category first"
                }
                disabled={!selectedCategoryName}
                {...register("subcategory")}
              />
            )}
            <FieldError message={errors.subcategory?.message} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input id="brand" placeholder="3M, Honeywell, MSA..." {...register("brand")} />
            <FieldError message={errors.brand?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" placeholder="HSE-HEL-0012" {...register("sku")} />
            <FieldError message={errors.sku?.message} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BasicInfoSection;
