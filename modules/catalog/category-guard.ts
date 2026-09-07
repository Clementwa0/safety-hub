import mongoose from "mongoose";

import { ProductModel } from "@/lib/models/Product";

export class CategoryReferencedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CategoryReferencedError";
  }
}

/**
 * A category can only be deleted once no product still references it -
 * `Product.category` is a required ObjectId ref (lib/models/Product.ts),
 * so deleting a category out from under an existing product would leave
 * it pointing at nothing (breaking the storefront category page and
 * admin filters for that product). Move or reassign those products'
 * category first.
 */
export async function assertCategoryDeletable(
  categoryId: string | mongoose.Types.ObjectId,
  session?: mongoose.ClientSession,
): Promise<void> {
  const productCount = await ProductModel.countDocuments({ category: categoryId }).session(session ?? null);

  if (productCount > 0) {
    throw new CategoryReferencedError(
      `This category still has ${productCount} product${productCount === 1 ? "" : "s"} assigned to it and cannot be deleted. Reassign or delete those products first.`,
    );
  }
}
