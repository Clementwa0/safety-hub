import mongoose from "mongoose";
import { CartModel, type ICart, type ICartItem } from "@/lib/models/Cart";
import { ProductModel, type IProduct } from "@/lib/models/Product";
import { calculateSubtotal } from "@/lib/storefront/pricing";
import type { CartIdentity } from "@/lib/storefront/session";

export class CartError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function identityFilter(identity: CartIdentity) {
  // NOTE: unlike StoreOrder, Cart's uniqueness is enforced by a unique
  // index on `user` ALONE (see `lib/models/Cart.ts` — "One cart per
  // authenticated user"), not a compound `{ user, userModel }` index.
  // Querying by `userModel` here as well can miss an existing cart (e.g.
  // one written before this field existed) and cause a duplicate-key
  // error on create, so the lookup intentionally matches the index: by
  // `user` alone. `userModel` is still recorded on create/below so the
  // cart's owner type is known for `.populate()` and other reads.
  if (identity.userId) return { user: identity.userId };
  if (identity.sessionId) return { sessionId: identity.sessionId };
  throw new CartError("No cart identity available", 400);
}

export async function getOrCreateCart(identity: CartIdentity): Promise<ICart> {
  const filter = identityFilter(identity);
  let cart = await CartModel.findOne(filter);

  if (!cart) {
    cart = await CartModel.create({
      ...filter,
      // `userModel` is only meaningful when `user` is set (identity.userId);
      // omitted entirely for guest carts.
      ...(identity.userId ? { userModel: identity.userModel } : {}),
      items: [],
    });
  }

  return cart;
}

/** Loads the cart's products in one query, keyed by product id string. */
async function loadProductsForCart(cart: ICart): Promise<Map<string, IProduct>> {
  const ids = cart.items.map((item) => item.product);
  if (ids.length === 0) return new Map();

  const products = await ProductModel.find({ _id: { $in: ids } }).populate("category", "name");
  return new Map(products.map((product) => [String(product._id), product]));
}

export interface SerializedCartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  category: string;
  price: number;
  stock: number;
  status: IProduct["status"];
  quantity: number;
  subtotal: number;
  unavailable: boolean;
  unavailableReason?: string;
}

export interface SerializedCart {
  id: string;
  items: SerializedCartItem[];
  itemCount: number;
  subtotal: number;
}

/**
 * Serializes a cart for the client, reading CURRENT product price/stock/status
 * from the database every time (never trusting anything cached on the cart
 * document itself). Items whose product was deleted or archived are flagged
 * `unavailable` rather than silently dropped, so the UI can tell the shopper
 * what happened instead of the item just vanishing.
 */
export async function serializeCart(cart: ICart): Promise<SerializedCart> {
  const products = await loadProductsForCart(cart);

  const items: SerializedCartItem[] = cart.items.map((item) => {
    const product = products.get(String(item.product));

    if (!product) {
      return {
        productId: String(item.product),
        name: "Product no longer available",
        slug: "",
        image: "",
        category: "",
        price: 0,
        stock: 0,
        status: "archived",
        quantity: item.quantity,
        subtotal: 0,
        unavailable: true,
        unavailableReason: "This product has been removed.",
      };
    }

    const unavailable = product.status === "archived";
    const subtotal = unavailable ? 0 : product.price * item.quantity;

    const rawCategory = product.category as unknown;
    const categoryName =
      rawCategory && typeof rawCategory === "object" && "name" in rawCategory
        ? String((rawCategory as { name?: unknown }).name ?? "")
        : "";

    return {
      productId: String(product._id),
      name: product.name,
      slug: product.slug,
      image: product.image,
      category: categoryName,
      price: product.price,
      stock: product.stock,
      status: product.status,
      quantity: item.quantity,
      subtotal,
      unavailable,
      unavailableReason: unavailable ? "This product is no longer available." : undefined,
    };
  });

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = calculateSubtotal(
    items.filter((item) => !item.unavailable).map((item) => ({ price: item.price, quantity: item.quantity })),
  );

  return {
    id: String(cart._id),
    items,
    itemCount,
    subtotal,
  };
}

async function assertAddable(product: IProduct | null, requestedQuantity: number) {
  if (!product) {
    throw new CartError("Product not found", 404);
  }
  if (product.status === "archived") {
    throw new CartError("This product is no longer available", 400);
  }
  if (requestedQuantity > product.stock) {
    throw new CartError(
      product.stock > 0
        ? `Only ${product.stock} unit(s) of "${product.name}" available`
        : `"${product.name}" is out of stock`,
      400,
    );
  }
}

export async function addItemToCart(
  identity: CartIdentity,
  productId: string,
  quantity: number,
): Promise<ICart> {
  if (!mongoose.isValidObjectId(productId)) {
    throw new CartError("Invalid product id", 400);
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new CartError("Quantity must be a positive whole number", 400);
  }

  const cart = await getOrCreateCart(identity);
  const product = await ProductModel.findById(productId);

  const existing = cart.items.find((item) => String(item.product) === productId);
  const newQuantity = (existing?.quantity ?? 0) + quantity;

  await assertAddable(product, newQuantity);

  if (existing) {
    existing.quantity = newQuantity;
  } else {
    // The schema declares `{ _id: false }` for cart items, so there's no
    // real `id` field on a pushed item — this cast is only to satisfy
    // Mongoose 9's `DocumentArray.push()` typing, not a behavior change.
    cart.items.push({ product: new mongoose.Types.ObjectId(productId), quantity } as ICartItem);
  }

  await cart.save();
  return cart;
}

export async function updateCartItemQuantity(
  identity: CartIdentity,
  productId: string,
  quantity: number,
): Promise<ICart> {
  if (!mongoose.isValidObjectId(productId)) {
    throw new CartError("Invalid product id", 400);
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new CartError("Quantity must be a positive whole number", 400);
  }

  const cart = await getOrCreateCart(identity);
  const item = cart.items.find((entry) => String(entry.product) === productId);

  if (!item) {
    throw new CartError("Item not found in cart", 404);
  }

  const product = await ProductModel.findById(productId);
  await assertAddable(product, quantity);

  item.quantity = quantity;
  await cart.save();
  return cart;
}

export async function removeCartItem(identity: CartIdentity, productId: string): Promise<ICart> {
  const cart = await getOrCreateCart(identity);
  cart.items = cart.items.filter((entry) => String(entry.product) !== productId) as typeof cart.items;
  await cart.save();
  return cart;
}

export async function clearCart(identity: CartIdentity): Promise<ICart> {
  const cart = await getOrCreateCart(identity);
  cart.items = [] as typeof cart.items;
  await cart.save();
  return cart;
}