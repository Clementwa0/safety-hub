import mongoose from "mongoose";
import { CartModel, type ICart, type ICartItem } from "@/lib/models/Cart";
import { ProductModel, type IProduct, type IProductVariant } from "@/lib/models/Product";
import { calculateShippingFee, calculateSubtotal, calculateTax, calculateTotal } from "@/modules/cart/pricing";
import { getSettings } from "@/lib/settings/get-settings.server";
import type { CartIdentity } from "@/modules/cart/session";
import { resolveFinancialSettingsForMutation } from "@/modules/settings/financial-settings";
import { getAvailableQuantity } from "@/types/product";

export class CartError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function identityFilter(identity: CartIdentity) {
  // Cart's uniqueness is enforced by a unique index on `user` alone (see
  // `lib/models/Cart.ts` - "One cart per authenticated user").
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

/** Finds the selected variant on a product, or null for a simple product /
 *  a variantSku that no longer exists on it. */
function resolveVariant(product: IProduct, variantSku?: string | null): IProductVariant | null {
  if (!variantSku) return null;
  if (!Array.isArray(product.variants)) return null;
  return (
    product.variants.find(
      (variant) => variant.sku.trim().toUpperCase() === variantSku.trim().toUpperCase(),
    ) ?? null
  );
}

function itemsMatch(item: ICartItem, productId: string, variantSku?: string | null): boolean {
  if (String(item.product) !== productId) return false;
  const normalizedIncoming = variantSku ? variantSku.trim().toUpperCase() : undefined;
  const normalizedExisting = item.variantSku ? item.variantSku.trim().toUpperCase() : undefined;
  return normalizedIncoming === normalizedExisting;
}

export interface SerializedCartItem {
  id: string;
  productId: string;
  variantSku?: string;
  size?: string;
  sku?: string;
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
  shippingFee: number;
  tax: number;
  /** Admin-configured Settings.taxRate (0-100) this cart's `tax` was computed with - shown to the shopper, e.g. "VAT (0%)". */
  taxRatePercent: number;
  total: number;
}

/**
 * Serializes a cart for the client, reading CURRENT product price/stock/status
 * from the database every time (never trusting anything cached on the cart
 * document itself). Items whose product was deleted or archived are flagged
 * `unavailable` rather than silently dropped, so the UI can tell the shopper
 * what happened instead of the item just vanishing. For variant items, price
 * and stock come from the matching variant, not the parent product.
 *
 * Shipping/tax/total are computed here too (not left to the client) so the
 * displayed numbers always reflect the current admin Settings.taxRate -
 * including a deliberate 0% rate - the same way `performCheckout` computes
 * the authoritative order totals.
 */
export async function serializeCart(cart: ICart): Promise<SerializedCart> {
  const products = await loadProductsForCart(cart);

  const items: SerializedCartItem[] = cart.items.map((item) => {
    const product = products.get(String(item.product));

    if (!product) {
      return {
        id: item.id,
        productId: String(item.product),
        variantSku: item.variantSku,
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

    const variant = resolveVariant(product, item.variantSku);
    const isVariantProduct = Array.isArray(product.variants) && product.variants.length > 0;

    // A variant product whose stored SKU no longer exists on the product
    // (e.g. the admin removed that size) is unavailable rather than
    // silently falling back to the parent product's numbers.
    if (isVariantProduct && item.variantSku && !variant) {
      return {
        id: item.id,
        productId: String(product._id),
        variantSku: item.variantSku,
        name: product.name,
        slug: product.slug,
        image: product.image,
        category: "",
        price: 0,
        stock: 0,
        status: product.status,
        quantity: item.quantity,
        subtotal: 0,
        unavailable: true,
        unavailableReason: "This size is no longer available.",
      };
    }

    const unavailable = product.status === "archived";
    const price = variant ? variant.price : product.price;
    const stock = getAvailableQuantity(variant ?? product);
    const subtotal = unavailable ? 0 : price * item.quantity;

    const rawCategory = product.category as unknown;
    const categoryName =
      rawCategory && typeof rawCategory === "object" && "name" in rawCategory
        ? String((rawCategory as { name?: unknown }).name ?? "")
        : "";

    return {
      id: item.id,
      productId: String(product._id),
      variantSku: variant?.sku,
      size: variant?.size,
      sku: variant?.sku ?? product.sku,
      name: product.name,
      slug: product.slug,
      image: variant?.image || product.image,
      category: categoryName,
      price,
      stock,
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

  const settings = resolveFinancialSettingsForMutation(await getSettings());
  const shippingFee = calculateShippingFee(subtotal);
  const tax = calculateTax(subtotal, settings.taxRate);
  const total = calculateTotal(subtotal, shippingFee, tax);

  return {
    id: String(cart._id),
    items,
    itemCount,
    subtotal,
    shippingFee,
    tax,
    taxRatePercent: settings.taxRate,
    total,
  };
}

/**
 * Validates that `variantSku` (when provided) actually belongs to
 * `product`, and returns the matching variant. Throws for a variant
 * product with no size selected, an unknown SKU, or insufficient stock.
 */
function assertAddable(
  product: IProduct | null,
  variantSku: string | undefined,
  requestedQuantity: number,
): IProductVariant | null {
  if (!product) {
    throw new CartError("Product not found", 404);
  }
  if (product.status === "archived") {
    throw new CartError("This product is no longer available", 400);
  }

  const isVariantProduct = Array.isArray(product.variants) && product.variants.length > 0;

  if (isVariantProduct) {
    if (!variantSku) {
      throw new CartError("Select a size before adding this product to your cart", 400);
    }
    const variant = resolveVariant(product, variantSku);
    if (!variant) {
      throw new CartError("Selected size is not available for this product", 400);
    }
    const available = Math.max(variant.stock - variant.reserved, 0);
    if (requestedQuantity > available) {
      throw new CartError(
        available > 0
          ? `Only ${available} unit(s) of "${product.name}" (${variant.size}) available`
          : `"${product.name}" (${variant.size}) is out of stock`,
        400,
      );
    }
    return variant;
  }

  if (variantSku) {
    throw new CartError("This product does not have size options", 400);
  }

  const available = getAvailableQuantity(product);
  if (requestedQuantity > available) {
    throw new CartError(
      available > 0
        ? `Only ${available} unit(s) of "${product.name}" available`
        : `"${product.name}" is out of stock`,
      400,
    );
  }
  return null;
}

export async function addItemToCart(
  identity: CartIdentity,
  productId: string,
  variantSku: string | undefined,
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

  const existing = cart.items.find((item) => itemsMatch(item, productId, variantSku));
  const newQuantity = (existing?.quantity ?? 0) + quantity;

  assertAddable(product, variantSku, newQuantity);

  if (existing) {
    existing.quantity = newQuantity;
  } else {
    // The schema declares `{ _id: false }` for cart items, so there's no
    // real `id` field on a pushed item - this cast is only to satisfy
    // Mongoose 9's `DocumentArray.push()` typing, not a behavior change.
    cart.items.push({
      product: new mongoose.Types.ObjectId(productId),
      variantSku,
      quantity,
    } as ICartItem);
  }

  await cart.save();
  return cart;
}

export async function updateCartItemQuantity(
  identity: CartIdentity,
  productId: string,
  variantSku: string | undefined,
  quantity: number,
): Promise<ICart> {
  if (!mongoose.isValidObjectId(productId)) {
    throw new CartError("Invalid product id", 400);
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new CartError("Quantity must be a positive whole number", 400);
  }

  const cart = await getOrCreateCart(identity);
  const item = cart.items.find((entry) => itemsMatch(entry, productId, variantSku));

  if (!item) {
    throw new CartError("Item not found in cart", 404);
  }

  const product = await ProductModel.findById(productId);
  assertAddable(product, variantSku, quantity);

  item.quantity = quantity;
  await cart.save();
  return cart;
}

export async function removeCartItem(
  identity: CartIdentity,
  productId: string,
  variantSku?: string,
): Promise<ICart> {
  const cart = await getOrCreateCart(identity);
  cart.items = cart.items.filter((entry) => !itemsMatch(entry, productId, variantSku)) as typeof cart.items;
  await cart.save();
  return cart;
}

export async function clearCart(identity: CartIdentity): Promise<ICart> {
  const cart = await getOrCreateCart(identity);
  cart.items = [] as typeof cart.items;
  await cart.save();
  return cart;
}
