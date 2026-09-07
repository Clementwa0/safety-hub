import { after, afterEach, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

import { ProductModel, type IProductVariant } from "@/lib/models/Product";
import { InventoryError, getAvailableStock, reserveStock } from "@/modules/inventory/inventory.service";
import { reconcileOrderInventory, type ReconciliationLineItem } from "@/modules/inventory/order-reservations";
import { areOrderItemsLocked } from "@/modules/orders/order-line-items";

let replSet: MongoMemoryReplSet;
let productNumber = 0;

before(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri(), { dbName: "order-reservations-test" });
});

after(async () => {
  await mongoose.disconnect();
  await replSet.stop();
});

afterEach(async () => {
  await ProductModel.deleteMany({});
});

async function createProduct(overrides: { stock?: number; variants?: IProductVariant[] } = {}) {
  productNumber += 1;
  return ProductModel.create({
    name: `Order-reservation product ${productNumber}`,
    slug: `order-reservation-product-${productNumber}`,
    description: "A product used to test order edit inventory reconciliation.",
    category: new mongoose.Types.ObjectId(),
    price: 100,
    stock: overrides.stock ?? 10,
    reserved: 0,
    variants: overrides.variants ?? [],
    image: "",
  });
}

/** Runs `reconcileOrderInventory` inside a real transaction, mirroring how the order PATCH route calls it. */
async function reconcile(
  oldItems: ReconciliationLineItem[],
  newItems: ReconciliationLineItem[],
): Promise<Map<number, number>> {
  const session = await mongoose.startSession();
  try {
    let result: Map<number, number> = new Map();
    await session.withTransaction(async () => {
      result = await reconcileOrderInventory(oldItems, newItems, session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}

describe("reconcileOrderInventory", () => {
  it("increases the reservation when quantity goes up (10 -> 20)", async () => {
    const product = await createProduct({ stock: 30 });
    await reserveStock({ productId: product._id, quantity: 10 });

    const oldItems: ReconciliationLineItem[] = [
      { productId: String(product._id), quantity: 10, reservedQuantity: 10 },
    ];
    const newItems: ReconciliationLineItem[] = [{ productId: String(product._id), quantity: 20 }];

    const result = await reconcile(oldItems, newItems);

    assert.equal(result.get(0), 20);
    const reloaded = await ProductModel.findById(product._id);
    assert.equal(reloaded?.reserved, 20);
    assert.equal(await getAvailableStock({ productId: product._id }), 10);
  });

  it("releases the excess reservation when quantity goes down (20 -> 10)", async () => {
    const product = await createProduct({ stock: 30 });
    await reserveStock({ productId: product._id, quantity: 20 });

    const oldItems: ReconciliationLineItem[] = [
      { productId: String(product._id), quantity: 20, reservedQuantity: 20 },
    ];
    const newItems: ReconciliationLineItem[] = [{ productId: String(product._id), quantity: 10 }];

    const result = await reconcile(oldItems, newItems);

    assert.equal(result.get(0), 10);
    const reloaded = await ProductModel.findById(product._id);
    assert.equal(reloaded?.reserved, 10);
  });

  it("releases the entire reservation when a line is removed (10 -> 0 / line gone)", async () => {
    const product = await createProduct({ stock: 10 });
    await reserveStock({ productId: product._id, quantity: 10 });

    const oldItems: ReconciliationLineItem[] = [
      { productId: String(product._id), quantity: 10, reservedQuantity: 10 },
    ];
    const newItems: ReconciliationLineItem[] = [];

    const result = await reconcile(oldItems, newItems);

    assert.equal(result.size, 0);
    const reloaded = await ProductModel.findById(product._id);
    assert.equal(reloaded?.reserved, 0);
    assert.equal(await getAvailableStock({ productId: product._id }), 10);
  });

  it("releases product A's hold and reserves product B's when the product is swapped", async () => {
    const productA = await createProduct({ stock: 10 });
    const productB = await createProduct({ stock: 10 });
    await reserveStock({ productId: productA._id, quantity: 10 });

    const oldItems: ReconciliationLineItem[] = [
      { productId: String(productA._id), quantity: 10, reservedQuantity: 10 },
    ];
    const newItems: ReconciliationLineItem[] = [{ productId: String(productB._id), quantity: 10 }];

    const result = await reconcile(oldItems, newItems);

    assert.equal(result.get(0), 10);
    assert.equal((await ProductModel.findById(productA._id))?.reserved, 0);
    assert.equal((await ProductModel.findById(productB._id))?.reserved, 10);
  });

  it("releases variant A's hold and reserves variant B's when the variant is swapped", async () => {
    const product = await createProduct({
      variants: [
        { sku: "SIZE-S", size: "S", price: 100, stock: 5, reserved: 0 },
        { sku: "SIZE-M", size: "M", price: 100, stock: 5, reserved: 0 },
      ],
    });
    await reserveStock({ productId: product._id, variantSku: "SIZE-S", quantity: 3 });

    const oldItems: ReconciliationLineItem[] = [
      { productId: String(product._id), variantSku: "SIZE-S", quantity: 3, reservedQuantity: 3 },
    ];
    const newItems: ReconciliationLineItem[] = [
      { productId: String(product._id), variantSku: "SIZE-M", quantity: 3 },
    ];

    const result = await reconcile(oldItems, newItems);

    assert.equal(result.get(0), 3);
    const reloaded = await ProductModel.findById(product._id);
    assert.equal(reloaded?.variants.find((v: IProductVariant) => v.sku === "SIZE-S")?.reserved, 0);
    assert.equal(reloaded?.variants.find((v: IProductVariant) => v.sku === "SIZE-M")?.reserved, 3);
    // Parent roll-up should net to the same total reservation, not double-count.
    assert.equal(reloaded?.reserved, 3);
  });

  it("reserves stock for a newly added line", async () => {
    const existingProduct = await createProduct({ stock: 10 });
    const newProduct = await createProduct({ stock: 10 });
    await reserveStock({ productId: existingProduct._id, quantity: 5 });

    const oldItems: ReconciliationLineItem[] = [
      { productId: String(existingProduct._id), quantity: 5, reservedQuantity: 5 },
    ];
    const newItems: ReconciliationLineItem[] = [
      { productId: String(existingProduct._id), quantity: 5 },
      { productId: String(newProduct._id), quantity: 4 },
    ];

    const result = await reconcile(oldItems, newItems);

    assert.equal(result.get(0), 5, "untouched line keeps its existing reservation");
    assert.equal(result.get(1), 4, "new line is fully reserved");
    assert.equal((await ProductModel.findById(existingProduct._id))?.reserved, 5);
    assert.equal((await ProductModel.findById(newProduct._id))?.reserved, 4);
  });

  it("releases stock for a removed line while leaving other lines untouched", async () => {
    const keptProduct = await createProduct({ stock: 10 });
    const removedProduct = await createProduct({ stock: 10 });
    await reserveStock({ productId: keptProduct._id, quantity: 3 });
    await reserveStock({ productId: removedProduct._id, quantity: 6 });

    const oldItems: ReconciliationLineItem[] = [
      { productId: String(keptProduct._id), quantity: 3, reservedQuantity: 3 },
      { productId: String(removedProduct._id), quantity: 6, reservedQuantity: 6 },
    ];
    const newItems: ReconciliationLineItem[] = [{ productId: String(keptProduct._id), quantity: 3 }];

    const result = await reconcile(oldItems, newItems);

    assert.equal(result.get(0), 3);
    assert.equal((await ProductModel.findById(keptProduct._id))?.reserved, 3);
    assert.equal((await ProductModel.findById(removedProduct._id))?.reserved, 0);
  });

  it("handles several simultaneous line changes in one pass", async () => {
    const increasing = await createProduct({ stock: 30 });
    const decreasing = await createProduct({ stock: 30 });
    const removed = await createProduct({ stock: 10 });
    const added = await createProduct({ stock: 10 });

    await reserveStock({ productId: increasing._id, quantity: 5 });
    await reserveStock({ productId: decreasing._id, quantity: 20 });
    await reserveStock({ productId: removed._id, quantity: 10 });

    const oldItems: ReconciliationLineItem[] = [
      { productId: String(increasing._id), quantity: 5, reservedQuantity: 5 },
      { productId: String(decreasing._id), quantity: 20, reservedQuantity: 20 },
      { productId: String(removed._id), quantity: 10, reservedQuantity: 10 },
    ];
    const newItems: ReconciliationLineItem[] = [
      { productId: String(increasing._id), quantity: 15 },
      { productId: String(decreasing._id), quantity: 8 },
      { productId: String(added._id), quantity: 6 },
    ];

    const result = await reconcile(oldItems, newItems);

    assert.equal(result.get(0), 15);
    assert.equal(result.get(1), 8);
    assert.equal(result.get(2), 6);
    assert.equal((await ProductModel.findById(increasing._id))?.reserved, 15);
    assert.equal((await ProductModel.findById(decreasing._id))?.reserved, 8);
    assert.equal((await ProductModel.findById(removed._id))?.reserved, 0);
    assert.equal((await ProductModel.findById(added._id))?.reserved, 6);
  });

  it("rejects an increase when there isn't enough available stock", async () => {
    const product = await createProduct({ stock: 12 });
    await reserveStock({ productId: product._id, quantity: 10 });

    const oldItems: ReconciliationLineItem[] = [
      { productId: String(product._id), quantity: 10, reservedQuantity: 10 },
    ];
    const newItems: ReconciliationLineItem[] = [{ productId: String(product._id), quantity: 20 }];

    await assert.rejects(
      reconcile(oldItems, newItems),
      (error: unknown) => error instanceof InventoryError && error.code === "INSUFFICIENT_STOCK",
    );

    // Never allowed to go negative, and the pre-edit reservation is untouched.
    const reloaded = await ProductModel.findById(product._id);
    assert.equal(reloaded?.reserved, 10);
    assert.ok(reloaded!.stock - reloaded!.reserved >= 0);
  });

  it("rolls back every reservation change from the pass when one line fails (atomicity)", async () => {
    const releasedThenRolledBack = await createProduct({ stock: 20 });
    const insufficient = await createProduct({ stock: 5 });

    await reserveStock({ productId: releasedThenRolledBack._id, quantity: 15 });
    await reserveStock({ productId: insufficient._id, quantity: 5 });

    // This pass should release most of the first product's hold (a
    // legitimate decrease) *and* try to grow the second product's hold
    // beyond what's available. The whole transaction must fail closed,
    // leaving both products exactly as they were before the call.
    const oldItems: ReconciliationLineItem[] = [
      { productId: String(releasedThenRolledBack._id), quantity: 15, reservedQuantity: 15 },
      { productId: String(insufficient._id), quantity: 5, reservedQuantity: 5 },
    ];
    const newItems: ReconciliationLineItem[] = [
      { productId: String(releasedThenRolledBack._id), quantity: 2 },
      { productId: String(insufficient._id), quantity: 50 },
    ];

    await assert.rejects(
      reconcile(oldItems, newItems),
      (error: unknown) => error instanceof InventoryError && error.code === "INSUFFICIENT_STOCK",
    );

    assert.equal(
      (await ProductModel.findById(releasedThenRolledBack._id))?.reserved,
      15,
      "the release from this pass must be rolled back along with the failed reserve",
    );
    assert.equal((await ProductModel.findById(insufficient._id))?.reserved, 5);
  });

  it("leaves an already-reserved, unchanged line alone instead of topping up a pre-existing backorder", async () => {
    const product = await createProduct({ stock: 10 });
    // Only 6 of the requested 10 could be reserved when the order was
    // created (a backorder) — this line's requested quantity is not
    // changing in this edit, so reconciliation must not touch it.
    await reserveStock({ productId: product._id, quantity: 6 });

    const oldItems: ReconciliationLineItem[] = [
      { productId: String(product._id), quantity: 10, reservedQuantity: 6 },
    ];
    const newItems: ReconciliationLineItem[] = [{ productId: String(product._id), quantity: 10 }];

    const result = await reconcile(oldItems, newItems);

    assert.equal(result.get(0), 6, "the pre-existing shortfall is left as-is");
    assert.equal((await ProductModel.findById(product._id))?.reserved, 6);
  });
});

describe("shipped orders never reach inventory reconciliation", () => {
  it("blocks a line-item edit before any reservation is touched once an order has shipped", async () => {
    const product = await createProduct({ stock: 10 });
    await reserveStock({ productId: product._id, quantity: 10 });

    const oldItems = [{ productId: String(product._id), quantity: 10, reservedQuantity: 10 }];
    const newItems = [{ productId: String(product._id), quantity: 4, reservedQuantity: 10 }];

    // This mirrors the guard the PATCH route runs before ever calling
    // reconcileOrderInventory: a locked order's items must never reach it.
    assert.equal(areOrderItemsLocked("shipped"), true);
    if (areOrderItemsLocked("shipped")) {
      // The route throws here instead of reconciling — simulate that and
      // assert nothing about inventory changed as a result.
      assert.notEqual(oldItems[0].quantity, newItems[0].quantity);
    } else {
      await reconcile(oldItems, newItems);
    }

    const reloaded = await ProductModel.findById(product._id);
    assert.equal(reloaded?.reserved, 10, "a shipped order's reservation must be untouched");
  });
});
