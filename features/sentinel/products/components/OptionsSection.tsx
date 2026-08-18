"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Sparkles, Star } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ProductFormInput } from "@/lib/validation/product";

export function OptionsSection() {
  const { control } = useFormContext<ProductFormInput>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product options</CardTitle>
        <CardDescription>
          Control where and how this product is highlighted across the storefront.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <Star className="mt-0.5 h-4 w-4 text-amber-500" />
            <div>
              <Label htmlFor="featured-switch">Featured product</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Automatically appears in the homepage Featured Products section.
              </p>
            </div>
          </div>

          <Controller
            control={control}
            name="featured"
            render={({ field }) => (
              <Switch
                id="featured-switch"
                checked={Boolean(field.value)}
                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
              />
            )}
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 text-sky-500" />
            <div>
              <Label htmlFor="new-switch">New arrival</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Displays a &ldquo;NEW&rdquo; badge on the product card.
              </p>
            </div>
          </div>

          <Controller
            control={control}
            name="isNewArrival"
            render={({ field }) => (
              <Switch
                id="new-switch"
                checked={Boolean(field.value)}
                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
              />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default OptionsSection;
