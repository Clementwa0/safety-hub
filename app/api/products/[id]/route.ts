import mongoose from "mongoose";
import { apiError, apiSuccess, serializeProduct } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { ProductModel } from "@/lib/models/Product";
import { CategoryModel } from "@/lib/models/Category";
import { requireStaff } from "@/lib/auth";
import { productPartialSchema } from "@/lib/validation/product";
import { slugify } from "@/lib/validation";
import { adjustStock, InventoryError, syncVariantInventory } from "@/modules/inventory/inventory.service";
import { recordAuditEvent } from "@/modules/audit/audit.service";
import { assertProductDeletable, ProductReferencedError } from "@/modules/catalog/product-guard";
import { NextRequest } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireStaff();
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
    const user = await requireStaff();
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

    // Resolving the category by name doesn't touch stock and doesn't need
    // to be inside the transaction below, same as the customer lookup in
    // the orders PATCH route.
    let resolvedCategoryId: string | undefined;
    if (parsed.data.category) {
      const category = await CategoryModel.findOne({ name: parsed.data.category });
      if (!category) {
        return apiError("Category does not exist", [], 400);
      }
      resolvedCategoryId = String(category._id);
    }

    const session = await mongoose.startSession();
    try {
      let updated: InstanceType<typeof ProductModel> | null = null;

      await session.withTransaction(async () => {
        const product = await ProductModel.findById(id).session(session);
        if (!product) {
          throw new Error("__PRODUCT_NOT_FOUND__");
        }

        const before = { name: product.name, price: product.price, status: product.status };

        // Guard the compare-at-price rule when only one of the two prices
        // is sent in a partial update (the schema's refine only sees this
        // request body, not the persisted document).
        const nextPrice = parsed.data.price ?? product.price;
        const nextCompareAtPrice = parsed.data.compareAtPrice ?? product.compareAtPrice;
        if (nextCompareAtPrice !== undefined && nextCompareAtPrice <= nextPrice) {
          throw new Error(
            "__VALIDATION__Original price must be greater than the selling price.",
          );
        }

        // Stock adjustments are deliberately excluded from the generic
        // product save: the inventory service is the sole authority for
        // stock/reserved mutations and records the corresponding Movement
        // ledger entry - both run inside this same transaction so the
        // product document and its inventory change commit or roll back
        // together.
        const { stock: requestedStock, variants: requestedVariants, ...productChanges } = parsed.data;
        Object.assign(product, productChanges);
        // Product.category is an ObjectId ref — never assign the raw
        // category name string that `parsed.data.category` carries.
        if (resolvedCategoryId) {
          product.category = new mongoose.Types.ObjectId(resolvedCategoryId);
        }
        if (parsed.data.name && parsed.data.name !== product.name) {
          product.slug = slugify(parsed.data.name);
        }
        await product.save({ session });

        if (requestedVariants !== undefined) {
          await syncVariantInventory({
            productId: product._id,
            variants: requestedVariants,
            actor: user.name || user.email || "system",
            session,
          });
        } else if (requestedStock !== undefined && requestedStock !== product.stock) {
          await adjustStock({
            productId: product._id,
            stock: requestedStock,
            actor: user.name || user.email || "system",
            session,
          });
        }

        const after = { name: product.name, price: product.price, status: product.status };
        if (JSON.stringify(before) !== JSON.stringify(after)) {
          await recordAuditEvent(
            {
              actor: user.name || user.email || "system",
              action: "product_mutated",
              entity: "Product",
              entityId: String(product._id),
              metadata: { before, after },
            },
            session,
          );
        }

        updated = product;
      });

      if (!updated) {
        return apiError("Product not found", [], 404);
      }

      const populated = await (updated as InstanceType<typeof ProductModel>).populate("category", "name slug");
      return apiSuccess(serializeProduct(populated.toObject()), "Product updated");
    } catch (error) {
      if (error instanceof InventoryError) {
        // A domain-level inventory failure (e.g. stock below reserved) —
        // not a server bug, so this is a client-facing conflict/validation
        // error rather than a 500. `session.withTransaction` has already
        // rolled back the transaction, so no partial write remains.
        const status = error.code === "INSUFFICIENT_STOCK" || error.code === "INVALID_ADJUSTMENT" ? 409 : 400;
        return apiError(error.message, [], status);
      }

      const message = error instanceof Error ? error.message : "Failed to update product";
      if (message === "__PRODUCT_NOT_FOUND__") {
        return apiError("Product not found", [], 404);
      }
      if (message.startsWith("__VALIDATION__")) {
        return apiError("Validation failed", [message.replace("__VALIDATION__", "")], 400);
      }

      return apiError(message, [], 500);
    } finally {
      await session.endSession();
    }
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update product", [], 500);
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
    const product = await ProductModel.findById(id);

    if (!product) {
      return apiError("Product not found", [], 404);
    }

    try {
      await assertProductDeletable(product._id as string);
    } catch (error) {
      if (error instanceof ProductReferencedError) {
        return apiError(error.message, [], 409);
      }
      throw error;
    }

    await ProductModel.deleteOne({ _id: product._id });

    await recordAuditEvent({
      actor: user.name || user.email || "system",
      action: "product_mutated",
      entity: "Product",
      entityId: String(product._id),
      metadata: { deleted: true, name: product.name },
    });

    return apiSuccess(null, "Product deleted");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete product", [], 500);
  }
}
