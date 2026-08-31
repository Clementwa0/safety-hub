import { after, afterEach, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { MovementModel } from "@/lib/models/Movement";
import { ProductModel, type IProductVariant } from "@/lib/models/Product";
import {
  adjustStock,
  getAvailableStock,
  InventoryError,
  releaseReservation,
  reserveStock,
  shipReservedStock,
  syncVariantInventory,
} from "@/modules/inventory/inventory.service";

let server: MongoMemoryServer;
let productNumber = 0;

before(async () => {
  server = await MongoMemoryServer.create();
  await mongoose.connect(server.getUri(), { dbName: "inventory-service-test" });
});

after(async () => {
  await mongoose.disconnect();
  await server.stop();
});

afterEach(async () => {
  await ProductModel.deleteMany({});
  await MovementModel.deleteMany({});
});

async function createProduct(overrides: { stock?: number; variants?: IProductVariant[] } = {}) {
  productNumber += 1;
  return ProductModel.create({
    name: `Inventory product ${productNumber}`,
    slug: `inventory-product-${productNumber}`,
    description: "A product used to test inventory domain behavior.",
    category: new mongoose.Types.ObjectId(),
    price: 100,
    stock: overrides.stock ?? 10,
    reserved: 0,
    variants: overrides.variants ?? [],
    image: "",
  });
}

describe("inventory service", () => {
  it("reserves simple-product stock atomically and reports live availability", async () => {
    const product = await createProduct({ stock: 5 });

    await reserveStock({ productId: product._id, quantity: 3 });

    assert.equal(await getAvailableStock({ productId: product._id }), 2);
    await assert.rejects(
      reserveStock({ productId: product._id, quantity: 3 }),
      (error: unknown) => error instanceof InventoryError && error.code === "INSUFFICIENT_STOCK",
    );

    const reloaded = await ProductModel.findById(product._id);
    assert.equal(reloaded?.stock, 5);
    assert.equal(reloaded?.reserved, 3);
  });

  it("keeps variant and parent reservation rollups in sync", async () => {
    const product = await createProduct({
      variants: [
        { sku: "SIZE-S", size: "S", price: 100, stock: 4, reserved: 0 },
        { sku: "SIZE-M", size: "M", price: 100, stock: 6, reserved: 0 },
      ],
    });

    await reserveStock({ productId: product._id, variantSku: "SIZE-S", quantity: 3 });

    const reloaded = await ProductModel.findById(product._id);
    assert.equal(reloaded?.reserved, 3);
    assert.equal(reloaded?.stock, 10);
    assert.equal(reloaded?.variants.find((variant: IProductVariant) => variant.sku === "SIZE-S")?.reserved, 3);
    assert.equal(await getAvailableStock({ productId: product._id, variantSku: "SIZE-S" }), 1);
  });

  it("does not release more inventory than is reserved", async () => {
    const product = await createProduct({ stock: 4 });
    await reserveStock({ productId: product._id, quantity: 2 });

    await assert.rejects(
      releaseReservation({ productId: product._id, quantity: 3 }),
      (error: unknown) => error instanceof InventoryError && error.code === "MISSING_RESERVATION",
    );
    await releaseReservation({ productId: product._id, quantity: 2 });

    const reloaded = await ProductModel.findById(product._id);
    assert.equal(reloaded?.reserved, 0);
  });

  it("ships a reservation by reducing stock and reserved together and records a movement", async () => {
    const product = await createProduct({ stock: 5 });
    await reserveStock({ productId: product._id, quantity: 2 });

    await shipReservedStock({
      productId: product._id,
      quantity: 2,
      movementType: "order_shipped",
      reference: "ORD-TEST-1",
    });

    const reloaded = await ProductModel.findById(product._id);
    assert.equal(reloaded?.stock, 3);
    assert.equal(reloaded?.reserved, 0);
    const movement = await MovementModel.findOne({ product: product._id });
    assert.equal(movement?.delta, -2);
    assert.equal(movement?.resultingStock, 3);
  });

  it("refuses a manual stock adjustment below held reservations", async () => {
    const product = await createProduct({ stock: 5 });
    await reserveStock({ productId: product._id, quantity: 3 });

    await assert.rejects(
      adjustStock({ productId: product._id, stock: 2 }),
      (error: unknown) => error instanceof InventoryError && error.code === "INVALID_ADJUSTMENT",
    );
    await adjustStock({ productId: product._id, stock: 6 });

    const reloaded = await ProductModel.findById(product._id);
    assert.equal(reloaded?.stock, 6);
    assert.equal(reloaded?.reserved, 3);
    const movement = await MovementModel.findOne({ product: product._id, type: "manual_adjustment" });
    assert.equal(movement?.delta, 1);
  });

  it("preserves existing variant reservations when an admin updates variant stock", async () => {
    const product = await createProduct({
      variants: [{ sku: "SIZE-L", size: "L", price: 100, stock: 5, reserved: 0 }],
    });
    await reserveStock({ productId: product._id, variantSku: "SIZE-L", quantity: 2 });

    await syncVariantInventory({
      productId: product._id,
      variants: [{ sku: "SIZE-L", size: "Large", price: 120, stock: 6, reserved: 0 }],
    });

    const reloaded = await ProductModel.findById(product._id);
    assert.equal(reloaded?.stock, 6);
    assert.equal(reloaded?.reserved, 2);
    assert.equal(reloaded?.variants[0].reserved, 2);
    assert.equal(reloaded?.variants[0].size, "Large");
  });
});
