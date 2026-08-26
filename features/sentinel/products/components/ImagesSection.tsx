"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Plus, Trash2, ImageIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudinaryImageField } from "@/components/shared/CloudinaryImageField";
import type { ProductFormInput } from "@/lib/validation/product";
import { FieldError } from "./FieldError";

export function ImagesSection() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ProductFormInput>();

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <CardHeader className="space-y-1 border-b px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
          </div>

          <CardTitle className="text-sm font-semibold">
            Product images
          </CardTitle>
        </div>

        <CardDescription className="text-xs">
          Add a main image and additional gallery images for the storefront.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 px-4 py-4 sm:px-5 sm:py-5">
        {/* Main image */}
        <div className="space-y-2">
          <div>
            <p className="text-xs font-medium">Main image</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              The primary image displayed on product cards and product pages.
            </p>
          </div>

          <Controller
            control={control}
            name="image"
            render={({ field }) => (
              <CloudinaryImageField
                id="product-main-image"
                label="Upload main image"
                folder="products"
                required
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            )}
          />

          <FieldError message={errors.image?.message} />
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Gallery */}
        <Controller
          control={control}
          name="images"
          render={({ field }) => (
            <GalleryUrlList
              value={(field.value as string[] | undefined) ?? []}
              onChange={field.onChange}
            />
          )}
        />
      </CardContent>
    </Card>
  );
}

function GalleryUrlList({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const setAt = (index: number, url: string) => {
    const next = [...value];
    next[index] = url;
    onChange(next);
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const addRow = () => {
    onChange([...value, ""]);
  };

  return (
    <div className="space-y-3">
      {/* Gallery heading */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium">Gallery images</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Add additional product angles and views.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          className="h-8 w-full gap-1.5 text-xs sm:w-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          Add image
        </Button>
      </div>

      {/* Gallery */}
      {value.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((url, index) => (
            <div
              key={index}
              className="group min-w-0 rounded-lg border bg-muted/20 p-2"
            >
              <CloudinaryImageField
                label={undefined}
                folder="products"
                size="compact"
                value={url}
                onChange={(next) => setAt(index, next)}
              />

              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="truncate text-[10px] text-muted-foreground">
                  Image {index + 1}
                </span>

                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  aria-label={`Remove image ${index + 1}`}
                  className="inline-flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={addRow}
          className="flex min-h-24 w-full flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-4 py-5 text-center transition-colors hover:bg-muted/40"
        >
          <ImageIcon className="mb-2 h-5 w-5 text-muted-foreground" />

          <span className="text-xs font-medium">
            Add gallery images
          </span>

          <span className="mt-0.5 text-[10px] text-muted-foreground">
            Upload additional product photos
          </span>
        </button>
      )}

      {/* Help text */}
      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Images are stored in Cloudinary under{" "}
        <span className="font-medium text-foreground">
          safety-hub/products
        </span>
        . Existing external image URLs are also supported.
      </p>
    </div>
  );
}

export default ImagesSection;