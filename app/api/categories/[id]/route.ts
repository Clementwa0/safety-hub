import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { CategoryModel } from "@/lib/models/Category";
import { requireStaff } from "@/lib/auth";
import { recordAuditEvent } from "@/modules/audit/audit.service";
import { assertCategoryDeletable, CategoryReferencedError } from "@/modules/catalog/category-guard";

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
    const user = await requireStaff();
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

    const before = { name: category.name, description: category.description };

    Object.assign(category, parsed.data);
    if (parsed.data.name) {
      category.slug = parsed.data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }
    await category.save();

    const after = { name: category.name, description: category.description };
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      await recordAuditEvent({
        actor: user.name || user.email || "system",
        action: "category_mutated",
        entity: "Category",
        entityId: String(category._id),
        metadata: { before, after },
      });
    }

    return apiSuccess(serializeDoc(category.toObject()), "Category updated");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update category", [], 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    await connectToDatabase();
    const category = await CategoryModel.findById(id);

    if (!category) {
      return apiError("Category not found", [], 404);
    }

    try {
      await assertCategoryDeletable(String(category._id));
    } catch (error) {
      if (error instanceof CategoryReferencedError) {
        return apiError(error.message, [], 409);
      }
      throw error;
    }

    await CategoryModel.deleteOne({ _id: category._id });

    await recordAuditEvent({
      actor: user.name || user.email || "system",
      action: "category_mutated",
      entity: "Category",
      entityId: String(category._id),
      metadata: { deleted: true, name: category.name },
    });

    return apiSuccess(null, "Category deleted");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete category", [], 500);
  }
}
