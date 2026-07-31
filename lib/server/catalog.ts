import { cache } from "react";

import { connectToDatabase } from "@/lib/db";
import { ProductModel } from "@/lib/models/Product";
import { CategoryModel } from "@/lib/models/Category";
import { normalizeProduct } from "@/services/product.service";
import type { Product } from "@/types/product";
import type { CategoryWithCount } from "@/types/category";


const FALLBACK_IMAGE =
"https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=70";


export const getPublicProducts = cache(
async (category?: string, status?: string): Promise<Product[]> => {
await connectToDatabase();

const filter: Record<string, unknown> = {};

if (category && category !== "all") {
filter.category = category;
    }

if (status && status !== "all") {
filter.status = status;
    }

const products = await ProductModel.find(filter).sort("-createdAt").lean();

return products.map((product) =>
normalizeProduct(product as unknown as Product & { _id?: string; [key: string]: unknown }),
    );
  },
);


export const getCategoriesWithCounts = cache(async (): Promise<CategoryWithCount[]> => {
await connectToDatabase();

const [categories, counts] = await Promise.all([
CategoryModel.find({}).sort("name").lean(),
ProductModel.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);

const countByCategory = new Map(counts.map((entry) => [entry._id, entry.count]));

return categories.map((category) => ({
id: String(category._id),
name: category.name,
slug: category.slug,
description: category.description ?? "",
image: category.image || FALLBACK_IMAGE,
createdAt: category.createdAt instanceof Date ? category.createdAt.getTime() : Date.now(),
updatedAt: category.updatedAt instanceof Date ? category.updatedAt.getTime() : undefined,
productCount: countByCategory.get(category.name) ?? 0,
  }));
});