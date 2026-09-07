import mongoose from "mongoose";

import { OrderModel } from "@/lib/models/Order";
import { QuotationModel } from "@/lib/models/Quotation";
import { InvoiceModel } from "@/lib/models/Invoice";
import { StoreOrderModel } from "@/lib/models/StoreOrder";

export class CustomerReferencedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomerReferencedError";
  }
}

/**
 * A customer can only be deleted once nothing in the commercial history
 * still points at it - Order.customer, Quotation.customer, and
 * Invoice.customer are all required ObjectId refs, and StoreOrder.customerId
 * links a storefront purchase to the same CRM record. Deleting a customer
 * with any of these would leave orders/quotations/invoices unable to
 * resolve who they belong to, and would silently rewrite sales history.
 * There is deliberately no cascading delete here - per
 * context/code-standards.md, prefer preserving commercial records over
 * destructive deletion.
 */
export async function assertCustomerDeletable(
  customerId: string | mongoose.Types.ObjectId,
  session?: mongoose.ClientSession,
): Promise<void> {
  const [orderCount, quotationCount, invoiceCount, storeOrderCount] = await Promise.all([
    OrderModel.countDocuments({ customer: customerId }).session(session ?? null),
    QuotationModel.countDocuments({ customer: customerId }).session(session ?? null),
    InvoiceModel.countDocuments({ customer: customerId }).session(session ?? null),
    StoreOrderModel.countDocuments({ customerId }).session(session ?? null),
  ]);

  if (orderCount + quotationCount + invoiceCount + storeOrderCount > 0) {
    throw new CustomerReferencedError(
      "This customer has orders, quotations, or invoices on record and cannot be deleted. Keep the record for auditability.",
    );
  }
}
