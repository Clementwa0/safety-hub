"use client";

import { useEffect, useState } from "react";
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
  const [errors, setErrors] =
    useState<ValidationErrors<CategoryInput>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (category) {
      setValues({
        name: category.name,
        description: category.description,
        image: category.image ?? "",
        subcategories: category.subcategories ?? [],
      });

      setSubcategoriesText(
        (category.subcategories ?? []).join(", "),
      );
    } else {
      setValues(EMPTY);
      setSubcategoriesText("");
    }

    setErrors({});
    setTouched({});
  }, [open, category]);

  const setField = <K extends keyof CategoryInput>(
    key: K,
    value: CategoryInput[K],
  ) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: undefined,
    }));
  };

  const handleBlur = (field: keyof CategoryInput) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const showError = (field: keyof CategoryInput) =>
    Boolean(touched[field] && errors[field]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const subcategories = subcategoriesText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const payload: CategoryInput = {
      ...values,
      subcategories,
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
      const firstError = Object.keys(nextErrors)[0];

      if (firstError) {
        document
          .getElementById(`category-${firstError}`)
          ?.focus();
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
        error instanceof Error
          ? error.message
          : "Could not save the category",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!saving) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent
        className={cn(
          // Mobile
          "w-[calc(100%-1rem)]",
          "max-h-[92vh]",
          "overflow-y-auto",
          "gap-0 p-0",

          // Desktop
          "sm:w-[calc(100%-2rem)]",
          "sm:max-w-xl",
          "sm:max-h-[90vh]",
        )}
      >
        {/* Header */}
        <DialogHeader
          className={cn(
            "border-b",
            "px-4 py-3.5",
            "sm:px-6 sm:py-5",
          )}
        >
          <DialogTitle
            className={cn(
              "text-base font-semibold tracking-tight",
              "sm:text-lg",
            )}
          >
            {category ? "Edit category" : "Create category"}
          </DialogTitle>

          <DialogDescription
            className={cn(
              "text-xs leading-relaxed",
              "sm:text-sm",
            )}
          >
            {category
              ? "Update the category information and organization details."
              : "Create a category to organize your products in the storefront."}
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div
            className={cn(
              "space-y-4 px-4 py-4",
              "sm:space-y-6 sm:px-6 sm:py-6",
            )}
          >
            {/* Name */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label
                htmlFor="category-name"
                className="text-xs font-medium sm:text-sm"
              >
                Category name
                <span className="ml-1 text-destructive">*</span>
              </Label>

              <Input
                id="category-name"
                value={values.name}
                onChange={(event) =>
                  setField("name", event.target.value)
                }
                onBlur={() => handleBlur("name")}
                placeholder="e.g. Head Protection"
                disabled={saving}
                autoFocus
                aria-invalid={showError("name")}
                className={cn(
                  "h-9 text-sm sm:h-10",
                  showError("name") &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              />

              {showError("name") && (
                <p className="text-[11px] text-destructive sm:text-xs">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="category-description"
                  className="text-xs font-medium sm:text-sm"
                >
                  Description
                </Label>

                <span className="text-[10px] text-muted-foreground sm:text-[11px]">
                  Optional
                </span>
              </div>

              <Textarea
                id="category-description"
                value={values.description}
                onChange={(event) =>
                  setField("description", event.target.value)
                }
                onBlur={() => handleBlur("description")}
                placeholder="Describe what products belong in this category..."
                rows={3}
                disabled={saving}
                aria-invalid={showError("description")}
                className={cn(
                  "min-h-[72px] resize-none text-sm",
                  "sm:min-h-0",
                  showError("description") &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              />

              <div className="flex justify-between gap-3 text-[10px] leading-tight text-muted-foreground sm:text-[11px]">
                <span className="max-w-[85%]">
                  A short description helps identify the category.
                </span>

                <span className="shrink-0">
                  {values.description?.length ?? 0}
                </span>
              </div>

              {showError("description") && (
                <p className="text-[11px] text-destructive sm:text-xs">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Image */}
            <div className="space-y-1.5 sm:space-y-2">
              <div>
                <Label className="text-xs font-medium sm:text-sm">
                  Category image
                </Label>

                <p className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-xs">
                  Used when displaying this category in the
                  storefront.
                </p>
              </div>

              <CloudinaryImageField
                id="category-image"
                label=""
                folder="categories"
                value={values.image ?? ""}
                onChange={(url) => setField("image", url)}
                helperText="Landscape images around 4:3 work best."
                disabled={saving}
                className={cn(
                  showError("image") &&
                    "border-destructive",
                )}
              />

              {showError("image") && (
                <p className="text-[11px] text-destructive sm:text-xs">
                  {errors.image}
                </p>
              )}
            </div>

            {/* Subcategories */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="category-subcategories"
                  className="text-xs font-medium sm:text-sm"
                >
                  Subcategories
                </Label>

                <span className="text-[10px] text-muted-foreground sm:text-[11px]">
                  Optional
                </span>
              </div>

              <Input
                id="category-subcategories"
                value={subcategoriesText}
                onChange={(event) =>
                  setSubcategoriesText(event.target.value)
                }
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
                placeholder="Hard Hats, Bump Caps, Full Brim"
                disabled={saving}
                aria-invalid={showError("subcategories")}
                className="h-9 text-sm sm:h-10"
              />

              <p className="text-[10px] leading-relaxed text-muted-foreground sm:text-[11px]">
                Separate multiple subcategories with commas.
              </p>

              {showError("subcategories") && (
                <p className="text-[11px] text-destructive sm:text-xs">
                  {errors.subcategories}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter
            className={cn(
              "flex-row justify-end gap-2",
              "border-t bg-muted/20",
              "px-4 py-3",
              "sm:px-6 sm:py-4",
            )}
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="min-w-[120px]"
            >
              {saving && (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              )}

              {saving
                ? category
                  ? "Saving..."
                  : "Creating..."
                : category
                  ? "Save changes"
                  : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}