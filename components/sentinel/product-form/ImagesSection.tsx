"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Plus } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageUrlInput } from "@/components/shared/ImageUrlInput";
import type { ProductFormInput } from "@/lib/schemas/product";
import { FieldError } from "./FieldError";

export function ImagesSection() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ProductFormInput>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product images</CardTitle>
        <CardDescription>
          Paste a public HTTPS image URL for the main image. Add extra gallery URLs to show more angles.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Controller
          control={control}
          name="image"
          render={({ field }) => (
            <ImageUrlInput
              id="product-main-image"
              label="Main image"
              required
              value={field.value ?? ""}
              onChange={field.onChange}
              placeholder="https://example.com/images/product.jpg"
            />
          )}
        />
        <FieldError message={errors.image?.message} />

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

  const addRow = () => onChange([...value, ""]);

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Gallery images</p>

      <div className="flex flex-wrap gap-4">
        {value.map((url, index) => (
          <div key={index} className="w-40">
            <ImageUrlInput
              label={undefined}
              size="compact"
              value={url}
              onChange={(next) => setAt(index, next)}
              placeholder="https://example.com/images/gallery.jpg"
            />
            <button
              type="button"
              onClick={() => removeAt(index)}
              className="mt-1 text-xs text-muted-foreground underline-offset-2 transition hover:text-destructive hover:underline"
            >
              Remove
            </button>
          </div>
        ))}

        <Button type="button" variant="outline" size="sm" onClick={addRow} className="h-9 self-start">
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add image URL
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Works with Cloudinary, ImageKit, S3, Supabase/Firebase Storage, GitHub raw content, or any public CDN link.
      </p>
    </div>
  );
}

export default ImagesSection;
