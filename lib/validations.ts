import type { ProductInput, ProductStatus } from "@/types/product";
import type { CategoryInput } from "@/types/category";
import { PRODUCT_STATUSES } from "@/types/product";
import { validateImageUrlFormat } from "@/lib/image-url";

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidStatus(value: string): value is ProductStatus {
  return (PRODUCT_STATUSES as readonly string[]).includes(value);
}

export function validateProduct(
  input: Partial<ProductInput>,
): ValidationErrors<ProductInput> {
  const errors: ValidationErrors<ProductInput> = {};

  if (!input.name || input.name.trim().length < 3) {
    errors.name = "Name must be at least 3 characters.";
  }

  if (!input.description || input.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters.";
  }

  if (!input.category) {
    errors.category = "Select a category.";
  }

  if (input.price === undefined || Number.isNaN(input.price) || input.price < 0) {
    errors.price = "Enter a valid price.";
  }

  if (
    input.stock === undefined ||
    Number.isNaN(input.stock) ||
    input.stock < 0 ||
    !Number.isInteger(input.stock)
  ) {
    errors.stock = "Stock must be a whole number of 0 or more.";
  }

  if (!input.status || !isValidStatus(input.status)) {
    errors.status = "Select a status.";
  }

  if (!input.image || input.image.trim().length === 0) {
    errors.image = "An image URL is required.";
  } else {
    const imageCheck = validateImageUrlFormat(input.image);
    if (!imageCheck.valid) {
      errors.image = imageCheck.reason;
    }
  }

  return errors;
}

export function validateCategory(
  input: Partial<CategoryInput>,
): ValidationErrors<CategoryInput> {
  const errors: ValidationErrors<CategoryInput> = {};

  if (!input.name || input.name.trim().length < 3) {
    errors.name = "Name must be at least 3 characters.";
  }

  if (!input.description || input.description.trim().length < 5) {
    errors.description = "Description must be at least 5 characters.";
  }

  if (input.image && input.image.trim().length > 0) {
    const imageCheck = validateImageUrlFormat(input.image);
    if (!imageCheck.valid) {
      errors.image = imageCheck.reason;
    }
  }

  return errors;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}
