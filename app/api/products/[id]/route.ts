import mongoose from "mongoose";
import { apiError, apiSuccess, serializeProduct } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { ProductModel } from "@/lib/models/Product";
import { CategoryModel } from "@/lib/models/Category";
import { requireAdmin } from "@/lib/auth";
import { productPartialSchema } from "@/lib/schemas/product";
import { slugify } from "@/lib/validations";
import { NextRequest } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin();
    const isAdmin = Boolean(user);

    const { id } = await params;
    await connectToDatabase();
    const product = await ProductModel.findById(id).populate("category", "name slug").lean();

    if (!product) {
      return apiError("Product not found", [], 404);
    }

    if (!isAdmin && product.status !== "active") {
      return apiError("Product not found", [], 404);
    }

    return apiSuccess(serializeProduct(product), "Product loaded");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load product", [], 500);
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
    const parsed = productPartialSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", parsed.error.issues.map((issue) => issue.message), 400);
    }

    await connectToDatabase();
    const product = await ProductModel.findById(id);

    if (!product) {
      return apiError("Product not found", [], 404);
    }

    let resolvedCategoryId: string | undefined;
    if (parsed.data.category) {
      const category = await CategoryModel.findOne({ name: parsed.data.category });
      if (!category) {
        return apiError("Category does not exist", [], 400);
      }
      resolvedCategoryId = String(category._id);
    }

    // Guard the compare-at-price rule when only one of the two prices is
    // sent in a partial update (the schema's refine only sees this request
    // body, not the persisted document).
    const nextPrice = parsed.data.price ?? product.price;
    const nextCompareAtPrice = parsed.data.compareAtPrice ?? product.compareAtPrice;
    if (nextCompareAtPrice !== undefined && nextCompareAtPrice <= nextPrice) {
      return apiError("Validation failed", ["Original price must be greater than the selling price."], 400);
    }

    Object.assign(product, parsed.data);
    // Product.category is an ObjectId ref — never assign the raw category
    // name string that `parsed.data.category` carries.
    if (resolvedCategoryId) {
      product.category = new mongoose.Types.ObjectId(resolvedCategoryId);
    }
    if (parsed.data.name && parsed.data.name !== product.name) {
      product.slug = slugify(parsed.data.name);
    }
    await product.save();

    const updated = await product.populate("category", "name slug");
    return apiSuccess(serializeProduct(updated.toObject()), "Product updated");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update product", [], 500);
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
    const product = await ProductModel.findByIdAndDelete(id);

    if (!product) {
      return apiError("Product not found", [], 404);
    }

    return apiSuccess(null, "Product deleted");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete product", [], 500);
  }
}
