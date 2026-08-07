import { StoreOrderModel, type IStoreOrder } from "@/lib/models/StoreOrder";
import { initiateStkPush, queryStkPushStatus, MpesaError } from "@/lib/mpesa";
import type { CartIdentity } from "@/lib/storefront/session";

export class OrderAccessError extends Error {
  constructor(
    message: string,
    public readonly status = 404,
  ) {
    super(message);
    this.name = "OrderAccessError";
  }
}

function assertOwnership(order: IStoreOrder, identity: CartIdentity) {
  const modelMismatch =
    Boolean(order.userModel) && Boolean(identity.userModel) && order.userModel !== identity.userModel;

  const owns =
    (identity.userId && order.user && !modelMismatch && String(order.user) === identity.userId) ||
    (identity.sessionId && order.sessionId && order.sessionId === identity.sessionId);

  if (!owns) {
    throw new OrderAccessError("Order not found", 404);
  }
}

async function loadOwnedOrder(orderId: string, identity: CartIdentity): Promise<IStoreOrder> {
  const order = await StoreOrderModel.findById(orderId);

  if (!order) {
    throw new OrderAccessError("Order not found", 404);
  }

  assertOwnership(order, identity);
  return order;
}

export async function triggerMpesaStkPush(
  orderId: string,
  identity: CartIdentity,
  phoneOverride?: string,
): Promise<IStoreOrder> {
  const order = await loadOwnedOrder(orderId, identity);

  if (order.paymentMethod !== "mpesa") {
    throw new OrderAccessError("This order is not set up for M-Pesa payment.", 400);
  }

  if (order.paymentStatus === "paid") {
    return order;
  }

  const phone = phoneOverride || order.mpesa?.phone || order.customer.phone;

  const result = await initiateStkPush({
    phone,
    amount: order.total,
    accountReference: order.orderNumber,
    transactionDesc: `Order ${order.orderNumber}`,
  });

  order.paymentStatus = "pending";
  order.mpesa = {
    phone,
    merchantRequestId: result.merchantRequestId,
    checkoutRequestId: result.checkoutRequestId,
    resultCode: undefined,
    resultDesc: result.customerMessage,
    receiptNumber: undefined,
    transactionDate: undefined,
    requestedAt: new Date(),
  };

  await order.save();
  return order;
}

export async function getMpesaPaymentStatus(orderId: string, identity: CartIdentity): Promise<IStoreOrder> {
  const order = await loadOwnedOrder(orderId, identity);

  if (order.paymentMethod !== "mpesa" || order.paymentStatus !== "pending" || !order.mpesa?.checkoutRequestId) {
    return order;
  }

  const requestedAt = order.mpesa.requestedAt ? new Date(order.mpesa.requestedAt).getTime() : 0;
  const elapsed = Date.now() - requestedAt;
if (elapsed < 5000) {
    return order;
  }

  try {
    const query = await queryStkPushStatus(order.mpesa.checkoutRequestId);

    if (query.status === "paid") {
      order.paymentStatus = "paid";
      order.mpesa.resultCode = query.resultCode;
      order.mpesa.resultDesc = query.resultDesc;
    } else if (query.status === "failed" || query.status === "cancelled") {
      order.paymentStatus = "failed";
      order.mpesa.resultCode = query.resultCode;
      order.mpesa.resultDesc = query.resultDesc || "Payment was not completed.";
    }
    // "pending" -> leave as-is, still waiting.

    if (order.isModified()) {
      await order.save();
    }
  } catch (error) {
   
    console.error("[mpesa] Status query failed:", error instanceof MpesaError ? error.message : error);
  }

  return order;
}

export interface DarajaCallbackItem {
  Name: string;
  Value?: string | number;
}

export interface DarajaCallbackPayload {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: { Item: DarajaCallbackItem[] };
    };
  };
}


export async function applyMpesaCallback(payload: DarajaCallbackPayload): Promise<void> {
  const callback = payload?.Body?.stkCallback;
  if (!callback?.CheckoutRequestID) return;

  const order = await StoreOrderModel.findOne({ "mpesa.checkoutRequestId": callback.CheckoutRequestID });
  if (!order) return;

  if (order.paymentStatus !== "pending") return;

  if (callback.ResultCode === 0) {
    const items = callback.CallbackMetadata?.Item ?? [];
    const find = (name: string) => items.find((item) => item.Name === name)?.Value;

    order.paymentStatus = "paid";
    if (order.mpesa) {
      order.mpesa.resultCode = String(callback.ResultCode);
      order.mpesa.resultDesc = callback.ResultDesc;
      order.mpesa.receiptNumber = find("MpesaReceiptNumber") ? String(find("MpesaReceiptNumber")) : undefined;
      order.mpesa.transactionDate = find("TransactionDate") ? String(find("TransactionDate")) : undefined;
    }
  } else {
    order.paymentStatus = "failed";
    if (order.mpesa) {
      order.mpesa.resultCode = String(callback.ResultCode);
      order.mpesa.resultDesc = callback.ResultDesc;
    }
  }

  await order.save();
}