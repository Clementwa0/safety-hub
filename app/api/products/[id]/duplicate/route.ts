import type { NextRequest } from "next/server";
import { apiError, apiSuccess, serializeProduct } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { ProductModel, type IProduct, type IProductVariant } from "@/lib/models/Product";
import { requireStaff } from "@/lib/auth";
import { slugify } from "@/lib/validation";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireStaff();
    if (!user) {
      return apiError("Unauthorized", [], 401);
    }

    const { id } = await params;
    await connectToDatabase();
    const source = await ProductModel.findById(id).lean<IProduct | null>();

    if (!source) {
      return apiError("Product not found", [], 404);
    }

    const { _id, createdAt, updatedAt, ...rest } = source;
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

    const duplicateVariants: IProductVariant[] = (rest.variants ?? []).map((variant: IProductVariant) => ({
      ...variant,
      reserved: 0,
    }));

    const duplicate = await ProductModel.create({
      ...rest,
      // Reservations belong to source orders, never to a catalog copy.
      reserved: 0,
      variants: duplicateVariants,
      name,
      slug,
      sku: rest.sku ? `${rest.sku}-COPY` : "",
      status: "draft",
      featured: false,
    });

    const populated = await duplicate.populate("category", "name slug");
    return apiSuccess(serializeProduct(populated.toObject()), "Product duplicated");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to duplicate product", [], 500);
  }
}
