import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeDoc } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { ProductModel } from "@/lib/models/Product";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/validations";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    await connectToDatabase();
    const source = await ProductModel.findById(id).lean();

    if (!source) {
      return apiError("Product not found", [], 404);
    }

    const { _id, createdAt, updatedAt, ...rest } = source as typeof source & {
      _id: unknown;
      createdAt: unknown;
      updatedAt: unknown;
    };
    void _id;
    void createdAt;
    void updatedAt;

    const name = `${rest.name} (Copy)`;
    let slug = slugify(name);

    // Slugs are unique — if a copy already exists, keep appending a counter.
    let attempt = 1;
    while (await ProductModel.exists({ slug })) {
      attempt += 1;
      slug = `${slugify(name)}-${attempt}`;
    }

    const duplicate = await ProductModel.create({
      ...rest,
      name,
      slug,
      sku: rest.sku ? `${rest.sku}-COPY` : "",
      status: "draft",
      featured: false,
    });

    return apiSuccess(serializeDoc(duplicate.toObject()), "Product duplicated");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to duplicate product", [], 500);
  }
}
