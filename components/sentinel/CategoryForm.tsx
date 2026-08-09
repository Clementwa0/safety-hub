"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUrlInput } from "@/components/shared/ImageUrlInput";
import { categoryService } from "@/services/shared/category.service";
import { hasErrors, validateCategory, type ValidationErrors } from "@/lib/validation";
import type { AdminCategory, CategoryInput } from "@/types/category";

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: AdminCategory | null;
  onSaved?: () => void;
}

const EMPTY: CategoryInput = { name: "", description: "", image: "", subcategories: [] };

export default function CategoryForm({
  open,
  onOpenChange,
  category,
  onSaved,
}: CategoryFormProps) {
  const [values, setValues] = useState<CategoryInput>(EMPTY);
  const [subcategoriesText, setSubcategoriesText] = useState("");
  const [errors, setErrors] = useState<ValidationErrors<CategoryInput>>({});
  const [saving, setSaving] = useState(false);

  // Reset the form whenever the dialog opens for a different category.
  const formKey = `${open ? "open" : "closed"}:${category?.id ?? "new"}`;
  const [lastFormKey, setLastFormKey] = useState(formKey);

  if (formKey !== lastFormKey) {
    setLastFormKey(formKey);
    setValues(
      open && category
        ? {
            name: category.name,
            description: category.description,
            image: category.image ?? "",
            subcategories: category.subcategories ?? [],
          }
        : EMPTY,
    );
    setSubcategoriesText(
      open && category ? (category.subcategories ?? []).join(", ") : "",
    );
    setErrors({});
  }

  const setField = <K extends keyof CategoryInput>(
    key: K,
    value: CategoryInput[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: CategoryInput = {
      ...values,
      subcategories: subcategoriesText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    const nextErrors = validateCategory(payload);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) return;

    setSaving(true);

    try {
      if (category) {
        await categoryService.update(category.id, payload);
        toast.success("Category updated");
      } else {
        await categoryService.create(payload);
        toast.success("Category created");
      }

      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save the category",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>
            Categories group products across the storefront.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              value={values.name}
              onChange={(event) => setField("name", event.target.value)}
              placeholder="Head Protection"
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name ? (
              <p className="text-xs text-destructive">{errors.name}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description">Description</Label>
            <Textarea
              id="category-description"
              rows={3}
              value={values.description}
              onChange={(event) => setField("description", event.target.value)}
              placeholder="Helmets, hard hats and accessories."
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description ? (
              <p className="text-xs text-destructive">{errors.description}</p>
            ) : null}
          </div>

          <ImageUrlInput
            id="category-image"
            label="Image URL (optional)"
            value={values.image ?? ""}
            onChange={(url) => setField("image", url)}
          />
          {errors.image ? (
            <p className="text-xs text-destructive">{errors.image}</p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="category-subcategories">Subcategories (optional)</Label>
            <Input
              id="category-subcategories"
              value={subcategoriesText}
              onChange={(event) => setSubcategoriesText(event.target.value)}
              onBlur={() =>
                setField(
                  "subcategories",
                  subcategoriesText
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                )
              }
              placeholder="Hard Hats, Bump Caps, Full Brim Helmets"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated. Powers the subcategory dropdown on the product form.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {category ? "Save changes" : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
