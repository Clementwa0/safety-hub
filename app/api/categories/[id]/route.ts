import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { CategoryModel } from "@/lib/models/Category";
import { requireAdmin } from "@/lib/auth";

const categorySchema = z.object({
  name: z.string().trim().min(3).optional(),
  description: z.string().trim().min(5).optional(),
  image: z.string().trim().optional(),
  subcategories: z.array(z.string().trim().min(1)).optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const category = await CategoryModel.findById(id).lean();

    if (!category) {
      return apiError("Category not found", [], 404);
    }

    return apiSuccess(serializeDoc(category), "Category loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load category", [], 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();
    const category = await CategoryModel.findById(id);

    if (!category) {
      return apiError("Category not found", [], 404);
    }

    Object.assign(category, parsed.data);
    if (parsed.data.name) {
      category.slug = parsed.data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }
    await category.save();

    return apiSuccess(serializeDoc(category.toObject()), "Category updated");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update category", [], 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    await connectToDatabase();
    const category = await CategoryModel.findByIdAndDelete(id);

    if (!category) {
      return apiError("Category not found", [], 404);
    }

    return apiSuccess(null, "Category deleted");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete category", [], 500);
  }
}
