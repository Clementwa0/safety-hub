import mongoose from "mongoose";
import { ProductModel, type IProduct, type IProductVariant } from "@/lib/models/Product";
import { recordMovement } from "@/modules/inventory/movements";

export interface InventoryItem {
  productId: mongoose.Types.ObjectId | string;
  variantSku?: string;
}

interface InventoryMutation extends InventoryItem {
  quantity: number;
  session?: mongoose.ClientSession;
}

export class InventoryError extends Error {
  constructor(
    message: string,
    readonly code: "INVALID_QUANTITY" | "INSUFFICIENT_STOCK" | "MISSING_RESERVATION" | "NOT_FOUND" | "INVALID_ADJUSTMENT",
  ) {
    super(message);
  }
}

function assertQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new InventoryError("Inventory quantity must be a positive whole number", "INVALID_QUANTITY");
  }
}

function variantAvailabilityFilter(variantSku: string, quantity: number) {
  return {
    $expr: {
      $anyElementTrue: {
        $map: {
          input: "$variants",
          as: "variant",
          in: {
            $and: [
              { $eq: ["$$variant.sku", variantSku] },
              { $gte: [{ $subtract: ["$$variant.stock", "$$variant.reserved"] }, quantity] },
            ],
          },
        },
      },
    },
  };
}

function variantReservationFilter(variantSku: string, quantity: number) {
  return {
    $expr: {
      $anyElementTrue: {
        $map: {
          input: "$variants",
          as: "variant",
          in: {
            $and: [
              { $eq: ["$$variant.sku", variantSku] },
              { $gte: ["$$variant.reserved", quantity] },
            ],
          },
        },
      },
    },
  };
}

function variantShipmentFilter(variantSku: string, quantity: number) {
  return {
    $expr: {
      $anyElementTrue: {
        $map: {
          input: "$variants",
          as: "variant",
          in: {
            $and: [
              { $eq: ["$$variant.sku", variantSku] },
              { $gte: ["$$variant.stock", quantity] },
              { $gte: ["$$variant.reserved", quantity] },
            ],
          },
        },
      },
    },
  };
}

function inventoryErrorForMissingMatch(item: InventoryItem, action: "reserve" | "release" | "ship"): InventoryError {
  const target = item.variantSku ? `variant ${item.variantSku}` : "product";
  if (action === "reserve") {
    return new InventoryError(`Insufficient available inventory for ${target}`, "INSUFFICIENT_STOCK");
  }
  return new InventoryError(`No matching inventory reservation exists for ${target}`, "MISSING_RESERVATION");
}

/**
 * The only domain service allowed to alter Product.stock or Product.reserved.
 * Variant updates also maintain the parent roll-up fields in the same atomic
 * database operation because query updates do not run Product's save hook.
 */
export async function reserveStock(input: InventoryMutation): Promise<void> {
  assertQuantity(input.quantity);

  const result = input.variantSku
    ? await ProductModel.updateOne(
        { _id: input.productId, ...variantAvailabilityFilter(input.variantSku, input.quantity) },
        { $inc: { "variants.$[variant].reserved": input.quantity, reserved: input.quantity } },
        { session: input.session, arrayFilters: [{ "variant.sku": input.variantSku }] },
      )
    : await ProductModel.updateOne(
        {
          _id: input.productId,
          $expr: { $gte: [{ $subtract: ["$stock", "$reserved"] }, input.quantity] },
        },
        { $inc: { reserved: input.quantity } },
        { session: input.session },
      );

  if (result.matchedCount === 0) {
    throw inventoryErrorForMissingMatch(input, "reserve");
  }
}

export async function releaseReservation(input: InventoryMutation): Promise<void> {
  assertQuantity(input.quantity);

  const result = input.variantSku
    ? await ProductModel.updateOne(
        { _id: input.productId, ...variantReservationFilter(input.variantSku, input.quantity) },
        { $inc: { "variants.$[variant].reserved": -input.quantity, reserved: -input.quantity } },
        { session: input.session, arrayFilters: [{ "variant.sku": input.variantSku }] },
      )
    : await ProductModel.updateOne(
        { _id: input.productId, reserved: { $gte: input.quantity } },
        { $inc: { reserved: -input.quantity } },
        { session: input.session },
      );

  if (result.matchedCount === 0) {
    throw inventoryErrorForMissingMatch(input, "release");
  }
}

export async function shipReservedStock(
  input: InventoryMutation & { movementType: "order_shipped" | "store_order_shipped"; reference: string },
): Promise<IProduct> {
  assertQuantity(input.quantity);

  const updated = input.variantSku
    ? await ProductModel.findOneAndUpdate(
        { _id: input.productId, ...variantShipmentFilter(input.variantSku, input.quantity) },
        {
          $inc: {
            "variants.$[variant].stock": -input.quantity,
            "variants.$[variant].reserved": -input.quantity,
            stock: -input.quantity,
            reserved: -input.quantity,
          },
        },
        {
          session: input.session,
          returnDocument: "after",
          arrayFilters: [{ "variant.sku": input.variantSku }],
        },
      )
    : await ProductModel.findOneAndUpdate(
        { _id: input.productId, stock: { $gte: input.quantity }, reserved: { $gte: input.quantity } },
        { $inc: { stock: -input.quantity, reserved: -input.quantity } },
        { session: input.session, returnDocument: "after" },
      );

  if (!updated) {
    throw inventoryErrorForMissingMatch(input, "ship");
  }

  await recordMovement({
    productId: updated._id as mongoose.Types.ObjectId,
    type: input.movementType,
    delta: -input.quantity,
    resultingStock: updated.stock,
    reference: input.reference,
    session: input.session,
  });

  return updated;
}

/** Compatibility path for historical orders created before reservations existed. */
export async function shipStock(
  input: InventoryMutation & { movementType: "order_shipped" | "store_order_shipped"; reference: string },
): Promise<IProduct> {
  assertQuantity(input.quantity);

  const updated = input.variantSku
    ? await ProductModel.findOneAndUpdate(
        { _id: input.productId, ...variantAvailabilityFilter(input.variantSku, input.quantity) },
        { $inc: { "variants.$[variant].stock": -input.quantity, stock: -input.quantity } },
        {
          session: input.session,
          returnDocument: "after",
          arrayFilters: [{ "variant.sku": input.variantSku }],
        },
      )
    : await ProductModel.findOneAndUpdate(
        { _id: input.productId, $expr: { $gte: ["$stock", input.quantity] } },
        { $inc: { stock: -input.quantity } },
        { session: input.session, returnDocument: "after" },
      );

  if (!updated) {
    throw new InventoryError("Insufficient on-hand inventory to ship this order", "INSUFFICIENT_STOCK");
  }

  await recordMovement({
    productId: updated._id as mongoose.Types.ObjectId,
    type: input.movementType,
    delta: -input.quantity,
    resultingStock: updated.stock,
    reference: input.reference,
    session: input.session,
  });

  return updated;
}

/** Adjusts the on-hand quantity for a simple product without changing reservations. */
export async function adjustStock(
  input: InventoryItem & { stock: number; session?: mongoose.ClientSession },
): Promise<IProduct> {
  if (!Number.isInteger(input.stock) || input.stock < 0) {
    throw new InventoryError("Stock must be a whole number of zero or more", "INVALID_ADJUSTMENT");
  }

  if (input.variantSku) {
    throw new InventoryError("Variant stock adjustments must be submitted with the product configuration", "INVALID_ADJUSTMENT");
  }

  const previous = await ProductModel.findOneAndUpdate(
    {
      _id: input.productId,
      variants: { $size: 0 },
      reserved: { $lte: input.stock },
    },
    { $set: { stock: input.stock } },
    { session: input.session, returnDocument: "before" },
  );

  if (!previous) {
    const existsQuery = ProductModel.exists({ _id: input.productId });
    if (input.session) {
      existsQuery.session(input.session);
    }
    const exists = await existsQuery;
    if (!exists) {
      throw new InventoryError("Product not found", "NOT_FOUND");
    }
    throw new InventoryError("Stock cannot be reduced below reserved inventory", "INVALID_ADJUSTMENT");
  }

  await recordMovement({
    productId: previous._id as mongoose.Types.ObjectId,
    type: "manual_adjustment",
    delta: input.stock - previous.stock,
    resultingStock: input.stock,
    session: input.session,
  });

  const updatedQuery = ProductModel.findById(input.productId);
  if (input.session) {
    updatedQuery.session(input.session);
  }
  const updated = await updatedQuery;
  if (!updated) {
    throw new InventoryError("Product not found", "NOT_FOUND");
  }
  return updated;
}

/**
 * Applies an admin product form's variant inventory configuration. Incoming
 * `reserved` values are never trusted: existing holds are preserved and new
 * variants always begin unreserved.
 */
export async function syncVariantInventory(input: {
  productId: mongoose.Types.ObjectId | string;
  variants: IProductVariant[];
  session?: mongoose.ClientSession;
}): Promise<IProduct> {
  const query = ProductModel.findById(input.productId);
  if (input.session) {
    query.session(input.session);
  }
  const current = await query;
  if (!current) {
    throw new InventoryError("Product not found", "NOT_FOUND");
  }

  const currentBySku = new Map<string, IProductVariant>(current.variants.map((variant: IProductVariant) => [variant.sku, variant]));
  const incomingSkus = new Set(input.variants.map((variant: IProductVariant) => variant.sku));
  for (const variant of current.variants) {
    if (!incomingSkus.has(variant.sku) && variant.reserved > 0) {
      throw new InventoryError("A variant with reserved inventory cannot be removed", "INVALID_ADJUSTMENT");
    }
  }

  const variants: IProductVariant[] = input.variants.map((variant: IProductVariant) => {
    const currentVariant = currentBySku.get(variant.sku);
    const reserved = currentVariant?.reserved ?? 0;
    if (variant.stock < reserved) {
      throw new InventoryError("Variant stock cannot be reduced below reserved inventory", "INVALID_ADJUSTMENT");
    }
    return { ...variant, reserved };
  });
  const stock = variants.reduce((total: number, variant: IProductVariant) => total + variant.stock, 0);
  const reserved = variants.reduce((total: number, variant: IProductVariant) => total + variant.reserved, 0);

  const updated = await ProductModel.findOneAndUpdate(
    { _id: current._id, updatedAt: current.updatedAt },
    { $set: { variants, stock, reserved } },
    { session: input.session, returnDocument: "after" },
  );
  if (!updated) {
    throw new InventoryError("Inventory changed while updating variants; please try again", "INVALID_ADJUSTMENT");
  }

  if (stock !== current.stock) {
    await recordMovement({
      productId: updated._id as mongoose.Types.ObjectId,
      type: "manual_adjustment",
      delta: stock - current.stock,
      resultingStock: stock,
      session: input.session,
    });
  }

  return updated;
}

export async function getAvailableStock(input: InventoryItem): Promise<number> {
  const product = await ProductModel.findById(input.productId).select("stock reserved variants").lean<IProduct | null>();
  if (!product) {
    throw new InventoryError("Product not found", "NOT_FOUND");
  }

  const variant = input.variantSku
    ? product.variants.find((entry: IProductVariant) => entry.sku === input.variantSku)
    : undefined;
  if (input.variantSku && !variant) {
    throw new InventoryError("Product variant not found", "NOT_FOUND");
  }

  const source: Pick<IProduct, "stock" | "reserved"> = variant ?? product;
  return Math.max(0, source.stock - source.reserved);
}
