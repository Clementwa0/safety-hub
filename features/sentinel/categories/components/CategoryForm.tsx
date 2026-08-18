"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
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
import { CloudinaryImageField } from "@/components/shared/CloudinaryImageField";
import { categoryService } from "@/services/shared/category.service";
import {
  hasErrors,
  validateCategory,
  type ValidationErrors,
} from "@/lib/validation";
import type { AdminCategory, CategoryInput } from "@/types/category";
import { cn } from "@/lib/utils";

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: AdminCategory | null;
  onSaved?: () => void;
}

const EMPTY: CategoryInput = {
  name: "",
  description: "",
  image: "",
  subcategories: [],
};

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
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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
    setTouched({});
  }

  const setField = <K extends keyof CategoryInput>(
    key: K,
    value: CategoryInput[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
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
    setTouched({
      name: true,
      description: true,
      image: true,
      subcategories: true,
    });

    if (hasErrors(nextErrors)) {
      // Focus the first field with an error
      const firstError = Object.keys(nextErrors)[0];
      if (firstError) {
        const element = document.getElementById(`category-${firstError}`);
        if (element) {
          element.focus();
        }
      }
      return;
    }

    setSaving(true);

    try {
      if (category) {
        await categoryService.update(category.id, payload);
        toast.success("Category updated successfully");
      } else {
        await categoryService.create(payload);
        toast.success("Category created successfully");
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

  const handleClose = () => {
    if (!saving) {
      onOpenChange(false);
    }
  };

  const showError = (field: keyof CategoryInput) => {
    return touched[field] && errors[field];
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl font-semibold">
            {category ? "Edit Category" : "New Category"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {category
              ? "Update the category details below."
              : "Create a new category to organize your products."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div className="space-y-1.5">
            <Label htmlFor="category-name" className="text-sm font-medium">
              Category Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="category-name"
              value={values.name}
              onChange={(event) => setField("name", event.target.value)}
              onBlur={() => handleBlur("name")}
              placeholder="e.g. Head Protection"
              className={cn(
                "h-10",
                showError("name") &&
                  "border-destructive focus-visible:ring-destructive",
              )}
              aria-invalid={Boolean(errors.name)}
              disabled={saving}
              autoFocus
            />
            {showError("name") && (
              <p className="text-xs text-destructive animate-in slide-in-from-top-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-1.5">
            <Label
              htmlFor="category-description"
              className="text-sm font-medium"
            >
              Description
            </Label>
            <Textarea
              id="category-description"
              rows={3}
              value={values.description}
              onChange={(event) => setField("description", event.target.value)}
              onBlur={() => handleBlur("description")}
              placeholder="e.g. Helmets, hard hats and accessories for safety."
              className={cn(
                "resize-none",
                showError("description") &&
                  "border-destructive focus-visible:ring-destructive",
              )}
              aria-invalid={Boolean(errors.description)}
              disabled={saving}
            />
            {showError("description") && (
              <p className="text-xs text-destructive animate-in slide-in-from-top-1">
                {errors.description}
              </p>
            )}
          </div>

          {/* Image Field */}
          <div className="space-y-1.5">
            <CloudinaryImageField
              id="category-image"
              label="Category Image"
              folder="categories"
              value={values.image ?? ""}
              onChange={(url) => setField("image", url)}
              helperText="Upload an image or paste a URL. Landscape images (4:3) work best."
              disabled={saving}
              className={cn(showError("image") && "border-destructive")}
            />
            {showError("image") && (
              <p className="text-xs text-destructive animate-in slide-in-from-top-1">
                {errors.image}
              </p>
            )}
          </div>

          {/* Subcategories Field */}
          <div className="space-y-1.5">
            <Label
              htmlFor="category-subcategories"
              className="text-sm font-medium"
            >
              Subcategories
            </Label>
            <Input
              id="category-subcategories"
              value={subcategoriesText}
              onChange={(event) => setSubcategoriesText(event.target.value)}
              onBlur={() => {
                handleBlur("subcategories");
                setField(
                  "subcategories",
                  subcategoriesText
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                );
              }}
              placeholder="Hard Hats, Bump Caps, Full Brim Helmets"
              className="h-10"
              disabled={saving}
            />
            <p className="text-[11px] text-muted-foreground">
              Separate subcategories with commas. They'll appear in the product
              form.
            </p>
            {showError("subcategories") && (
              <p className="text-xs text-destructive animate-in slide-in-from-top-1">
                {errors.subcategories}
              </p>
            )}
          </div>

          {/* Footer */}
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
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {category ? "Save changes" : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
