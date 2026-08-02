import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, getPaginationParams, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { CategoryModel } from "@/lib/models/Category";
import { ProductModel } from "@/lib/models/Product";
import { requireAdmin } from "@/lib/auth";

const categorySchema = z.object({
  name: z.string().trim().min(3),
  description: z.string().trim().min(5).optional().default(""),
  image: z.string().trim().optional().default(""),
  subcategories: z.array(z.string().trim().min(1)).optional().default([]),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, sort, query } = getPaginationParams(searchParams);

    await connectToDatabase();
    const filter = query
      ? {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
          ],
        }
      : {};

    const [categories, total, counts] = await Promise.all([
      CategoryModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      CategoryModel.countDocuments(filter),
      // Single grouped count instead of pulling every product into memory
      // and filtering it per-category in JS (an O(categories * products)
      // scan that got slower as the catalog grew).
      ProductModel.aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    ]);

    // The aggregate groups by Product.category, which is an ObjectId — key
    // the lookup map by the stringified id, not by category name.
    const countByCategory = new Map(counts.map((entry) => [String(entry._id), entry.count]));
    const payload = categories.map((category) =>
      serializeDoc({
        ...category,
        productCount: countByCategory.get(String(category._id)) ?? 0,
      }),
    );

    return apiSuccess({
      items: payload,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }, "Categories loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load categories", [], 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const body = await request.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();
    const slug = parsed.data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const category = await CategoryModel.create({
      ...parsed.data,
      slug,
    });

    return apiSuccess(serializeDoc(category.toObject()), "Category created");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create category", [], 500);
  }
}
