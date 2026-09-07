import mongoose from "mongoose";

import { OrderModel } from "@/lib/models/Order";
import { QuotationModel } from "@/lib/models/Quotation";
import { InvoiceModel } from "@/lib/models/Invoice";
import { StoreOrderModel } from "@/lib/models/StoreOrder";
import { CartModel } from "@/lib/models/Cart";

/**
 * Thrown when a product cannot be hard-deleted because something else in
 * the system still points at it. Callers should surface `.message`
 * directly to the client as a 409 - it already explains what to do
 * instead (archive the product).
 */
export class ProductReferencedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductReferencedError";
  }
}

/**
 * A product can only be permanently deleted once nothing in the system
 * still references it. Sales/quotation/invoice history must survive for
 * auditability even after a product is discontinued - per
 * context/code-standards.md ("Prefer archival/lifecycle changes over
 * destructive deletion") - so any product with commercial history is
 * blocked from deletion; use `status: "archived"` (a PATCH) to remove it
 * from the storefront instead. Live shopping carts are also checked so an
 * in-flight checkout can never end up pointing at a product that no
 * longer exists.
 *
 * Sales Order/Quotation/Invoice line items store `productId` as a plain
 * string (not an ObjectId ref - see lib/models/Order.ts), so those three
 * are matched against the string form of the id. StoreOrder and Cart
 * items store a real `Product` ObjectId ref and are matched against that.
 *
 * Pass `session` to read a consistent snapshot when this check runs
 * alongside other work in the same transaction.
 */
export async function assertProductDeletable(
  productId: string | mongoose.Types.ObjectId,
  session?: mongoose.ClientSession,
): Promise<void> {
  const idString = String(productId);

  const [orderCount, quotationCount, invoiceCount, storeOrderCount] = await Promise.all([
    OrderModel.countDocuments({ "items.productId": idString }).session(session ?? null),
    QuotationModel.countDocuments({ "items.productId": idString }).session(session ?? null),
    InvoiceModel.countDocuments({ "items.productId": idString }).session(session ?? null),
    StoreOrderModel.countDocuments({ "items.product": productId }).session(session ?? null),
  ]);

  if (orderCount + quotationCount + invoiceCount + storeOrderCount > 0) {
    throw new ProductReferencedError(
      "This product has sales, quotation, or invoice history and cannot be deleted. Set its status to \"archived\" instead to remove it from the storefront while preserving that history.",
    );
  }

  const cartCount = await CartModel.countDocuments({ "items.product": productId }).session(session ?? null);
  if (cartCount > 0) {
    throw new ProductReferencedError(
      "This product is currently in one or more customer carts and cannot be deleted. Archive it instead so it no longer appears on the storefront.",
    );
  }
}
