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

/** Only the order's own customer (or the guest session that placed it) may
 *  trigger or check on its M-Pesa payment — never inferred from the order
 *  id alone. */
function assertOwnership(order: IStoreOrder, identity: CartIdentity) {
  const owns =
    (identity.userId && order.user && String(order.user) === identity.userId) ||
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

/**
 * Sends (or re-sends) the STK push for an order the customer placed with
 * `paymentMethod: "mpesa"`. Safe to call again after a failed/cancelled
 * attempt — each call overwrites the previous CheckoutRequestID so status
 * checks always look at the latest attempt.
 */
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

/**
 * Returns the order's current payment status, actively polling Safaricom
 * if the async callback doesn't seem to have arrived yet (a few seconds
 * have passed since the push was sent and we're still "pending"). This is
 * what keeps the checkout success page's polling loop moving even when the
 * callback URL is unreachable (e.g. local dev without a tunnel).
 */
export async function getMpesaPaymentStatus(orderId: string, identity: CartIdentity): Promise<IStoreOrder> {
  const order = await loadOwnedOrder(orderId, identity);

  if (order.paymentMethod !== "mpesa" || order.paymentStatus !== "pending" || !order.mpesa?.checkoutRequestId) {
    return order;
  }

  const requestedAt = order.mpesa.requestedAt ? new Date(order.mpesa.requestedAt).getTime() : 0;
  const elapsed = Date.now() - requestedAt;

  // Give the async callback a head start before we start polling Safaricom
  // ourselves — most callbacks land within a couple of seconds.
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
    // A query failure doesn't mean the payment failed — just that we
    // couldn't check right now. Leave the order pending and let the next
    // poll (or the callback) resolve it.
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

/**
 * Applies the result Safaricom posts to `/api/mpesa/callback` once the
 * customer has responded to the STK prompt (or it times out/gets
 * cancelled). Looks the order up by CheckoutRequestID — there's no
 * customer session on this request, Safaricom calls it server-to-server.
 */
export async function applyMpesaCallback(payload: DarajaCallbackPayload): Promise<void> {
  const callback = payload?.Body?.stkCallback;
  if (!callback?.CheckoutRequestID) return;

  const order = await StoreOrderModel.findOne({ "mpesa.checkoutRequestId": callback.CheckoutRequestID });
  if (!order) return;

  // The callback can arrive after we've already resolved the payment via
  // the polling fallback (`getMpesaPaymentStatus`) — don't let a late
  // duplicate flip a settled order back around.
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
