import { cache } from "react";

import { connectToDatabase } from "@/lib/db";
import { ProductModel } from "@/lib/models/Product";
import { CategoryModel } from "@/lib/models/Category";
import { normalizeProduct } from "@/services/product.service";
import type { Product } from "@/types/product";
import type { CategoryWithCount } from "@/types/category";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=70";

/** Plain, JSON-serializable shape of a Category document (post `.lean()`). */
export interface LeanCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  subcategories: string[];
}

interface LeanCategoryDoc {
  _id: unknown;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  subcategories?: string[];
}

function serializeCategory(category: LeanCategoryDoc): LeanCategory {
  return {
    id: String(category._id),
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    image: category.image || "",
    subcategories: Array.isArray(category.subcategories) ? category.subcategories : [],
  };
}

/**
 * Looks up a single category by its URL slug. This is the only supported
 * way to resolve `/categories/[slug]` — never query products by name or
 * slug directly, always go through the category's `_id`.
 */
export const getCategoryBySlug = cache(
  async (slug: string): Promise<LeanCategory | null> => {
    await connectToDatabase();
    const category = await CategoryModel.findOne({ slug: slug.toLowerCase() }).lean();
    return category ? serializeCategory(category) : null;
  },
);

/**
 * Fetches active-by-default public products for a given category `_id`.
 * `categoryId` must be a Category ObjectId string (e.g. from
 * `getCategoryBySlug`), never a slug or display name.
 */
export const getProductsByCategoryId = cache(
  async (categoryId: string, status: string = "active"): Promise<Product[]> => {
    await connectToDatabase();

    const filter: Record<string, unknown> = { category: categoryId };
    if (status && status !== "all") {
      filter.status = status;
    }

    const products = await ProductModel.find(filter)
      .populate("category", "name slug")
      .sort("-createdAt")
      .lean();

    return products.map((product) => {
      const populatedCategory = product.category as unknown as
        | { _id: unknown; name: string; slug: string }
        | null
        | undefined;

      return normalizeProduct({
        ...product,
        _id: String((product as { _id: unknown })._id),
        category: populatedCategory?.name ?? "Safety Equipment",
      } as unknown as Product & { _id?: string; [key: string]: unknown });
    });
  },
);

/** All categories with a live count of how many products reference each one. */
export const getCategoriesWithCounts = cache(async (): Promise<CategoryWithCount[]> => {
  await connectToDatabase();

  const [categories, counts] = await Promise.all([
    CategoryModel.find({}).sort("name").lean(),
    // Group by the Product.category ObjectId (not a name/slug string) since
    // that's what's actually stored on the product documents.
    ProductModel.aggregate<{ _id: unknown; count: number }>([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);

  const countByCategory = new Map(counts.map((entry) => [String(entry._id), entry.count]));

  return categories.map((category) => ({
    id: String(category._id),
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    image: category.image || FALLBACK_IMAGE,
    createdAt: category.createdAt instanceof Date ? category.createdAt.getTime() : Date.now(),
    updatedAt: category.updatedAt instanceof Date ? category.updatedAt.getTime() : undefined,
    productCount: countByCategory.get(String(category._id)) ?? 0,
  }));
});
