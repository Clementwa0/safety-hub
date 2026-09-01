import { after, afterEach, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

import { CartModel } from "@/lib/models/Cart";
import { CounterModel } from "@/lib/models/Counter";
import { CustomerModel } from "@/lib/models/Customer";
import { ProductModel } from "@/lib/models/Product";
import { StoreOrderModel } from "@/lib/models/StoreOrder";
import { performCheckout, type CheckoutInput } from "@/modules/checkout/checkout";
import { checkoutSchema } from "@/modules/checkout/validation";
import { CartError } from "@/modules/cart/cart";

let replSet: MongoMemoryReplSet;
let productNumber = 0;

const guestInput: CheckoutInput = {
  customer: { name: "Guest Customer", email: "guest@example.com", phone: "0712345678" },
  shippingAddress: { address: "1 Safety Way", city: "Nairobi", country: "Kenya" },
  paymentMethod: "cod",
};

before(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri(), { dbName: "checkout-test" });
});

after(async () => {
  await mongoose.disconnect();
  await replSet.stop();
});

afterEach(async () => {
  await Promise.all([
    CartModel.deleteMany({}),
    CounterModel.deleteMany({}),
    CustomerModel.deleteMany({}),
    ProductModel.deleteMany({}),
    StoreOrderModel.deleteMany({}),
  ]);
});

async function createProduct(stock = 5, price = 1_200) {
  productNumber += 1;
  return ProductModel.create({
    name: `Checkout product ${productNumber}`,
    slug: `checkout-product-${productNumber}`,
    description: "Product used to verify checkout behavior.",
    category: new mongoose.Types.ObjectId(),
    price,
    stock,
    reserved: 0,
    image: "",
  });
}

async function createCart(sessionId: string, productId: mongoose.Types.ObjectId, quantity: number) {
  return CartModel.create({
    sessionId,
    items: [{ product: productId, quantity }],
  });
}

describe("storefront checkout", () => {
  it("creates a guest order without a user account and reserves its live inventory", async () => {
    const product = await createProduct(3);
    await createCart("guest-checkout-session", product._id as mongoose.Types.ObjectId, 2);

    const order = await performCheckout(
      { sessionId: "guest-checkout-session", isNewSession: false },
      guestInput,
    );

    assert.equal(order.sessionId, "guest-checkout-session");
    assert.equal(order.user, undefined);
    assert.equal(order.customer.email, guestInput.customer.email);
    assert.equal(order.shippingAddress.address, guestInput.shippingAddress.address);
    assert.equal(order.shippingAddress.city, guestInput.shippingAddress.city);
    assert.equal(order.shippingAddress.country, guestInput.shippingAddress.country);
    assert.equal(order.items[0].price, 1_200);
    assert.equal(order.subtotal, 2_400);
    assert.equal(order.paymentStatus, "pending");
    assert.ok(order.customerId, "guest checkout keeps a traceable CRM customer reference");

    const reloadedProduct = await ProductModel.findById(product._id);
    const cart = await CartModel.findOne({ sessionId: "guest-checkout-session" });
    assert.equal(reloadedProduct?.stock, 3);
    assert.equal(reloadedProduct?.reserved, 2);
    assert.deepEqual(cart?.items, []);
  });

  it("rejects invalid guest contact and delivery details before checkout", () => {
    const parsed = checkoutSchema.safeParse({
      customer: { name: "A", email: "not-an-email", phone: "123" },
      shippingAddress: { address: "x", city: "N", country: "K" },
      paymentMethod: "cod",
    });

    assert.equal(parsed.success, false);
  });

  it("uses current server prices and recomputes totals instead of client values", async () => {
    const product = await createProduct(2, 1_500);
    await createCart("untrusted-totals-session", product._id as mongoose.Types.ObjectId, 2);

    const inputWithForgedValues = {
      ...guestInput,
      subtotal: 1,
      shippingFee: 0,
      tax: 0,
      total: 1,
      paymentStatus: "paid",
    };
    const parsed = checkoutSchema.parse(inputWithForgedValues);
    const order = await performCheckout(
      { sessionId: "untrusted-totals-session", isNewSession: false },
      parsed,
    );

    assert.equal(order.items[0].price, 1_500);
    assert.equal(order.subtotal, 3_000);
    assert.equal(order.shippingFee, 500);
    assert.equal(order.total, order.subtotal + order.shippingFee + order.tax);
    assert.equal(order.paymentStatus, "pending");
  });

  it("rejects insufficient live inventory without creating an order or reservation", async () => {
    const product = await createProduct(1);
    await createCart("insufficient-stock-session", product._id as mongoose.Types.ObjectId, 2);

    await assert.rejects(
      performCheckout({ sessionId: "insufficient-stock-session", isNewSession: false }, guestInput),
      (error: unknown) => error instanceof CartError && error.status === 400,
    );

    assert.equal(await StoreOrderModel.countDocuments({}), 0);
    assert.equal((await ProductModel.findById(product._id))?.reserved, 0);
    assert.equal((await CartModel.findOne({ sessionId: "insufficient-stock-session" }))?.items.length, 1);
  });

  it("allows at most one concurrent guest checkout to reserve the final unit", async () => {
    const product = await createProduct(1);
    await Promise.all([
      createCart("concurrent-guest-one", product._id as mongoose.Types.ObjectId, 1),
      createCart("concurrent-guest-two", product._id as mongoose.Types.ObjectId, 1),
    ]);

    const results = await Promise.allSettled([
      performCheckout({ sessionId: "concurrent-guest-one", isNewSession: false }, guestInput),
      performCheckout({
        sessionId: "concurrent-guest-two",
        isNewSession: false,
      }, { ...guestInput, customer: { ...guestInput.customer, email: "second-guest@example.com" } }),
    ]);

    assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
    assert.equal(results.filter((result) => result.status === "rejected").length, 1);
    assert.equal((await ProductModel.findById(product._id))?.reserved, 1);
    assert.equal(await StoreOrderModel.countDocuments({}), 1);
  });

  it("keeps authenticated customer checkout ownership working", async () => {
    const product = await createProduct(2);
    const userId = new mongoose.Types.ObjectId();
    await CartModel.create({ user: userId, items: [{ product: product._id, quantity: 1 }] });

    const order = await performCheckout(
      { userId: String(userId), isNewSession: false },
      guestInput,
    );

    assert.equal(String(order.user), String(userId));
    assert.equal(order.sessionId, undefined);
    assert.equal((await ProductModel.findById(product._id))?.reserved, 1);
  });
});
