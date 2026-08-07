import { formatKES } from "@/lib/format";

/**
 * WhatsApp Checkout is a *parallel* ordering channel, not a replacement for
 * the normal checkout. It never creates a `StoreOrder` — it only builds a
 * pre-filled message and hands the customer off to WhatsApp, where a human
 * takes over. Because of that, everything in this module is pure/client-safe
 * and deliberately has no dependency on the database or the checkout API.
 */

export type WhatsAppPreferredPayment = "mpesa" | "cod";

export interface WhatsAppOrderItem {
  name: string;
  quantity: number;
  /** price * quantity, already resolved by the caller. */
  lineTotal: number;
}

export interface WhatsAppCustomerInfo {
  name: string;
  phone: string;
  /** Omitted for guests who didn't provide one. */
  email?: string;
  /** Single formatted line, e.g. "123 Ngong Rd, Westlands, Nairobi, Kenya". */
  address: string;
}

export interface WhatsAppOrderTotals {
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
}

export interface BuildWhatsAppOrderMessageInput {
  customer: WhatsAppCustomerInfo;
  items: WhatsAppOrderItem[];
  totals: WhatsAppOrderTotals;
  preferredPayment: WhatsAppPreferredPayment;
  reference: string;
}

/**
 * Generates a temporary, human-friendly reference for a WhatsApp order,
 * e.g. `WH-20260805-431207`. This is only ever mentioned in the chat
 * message so the team can find/tag the conversation — it is NOT a
 * database order id and nothing in the app looks it up.
 */
export function generateWhatsAppReference(date: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  const datePart = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  const timePart = `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  return `WH-${datePart}-${timePart}`;
}

/**
 * Builds the exact text sent to WhatsApp. Kept as one function so every
 * entry point (Cart page button, Checkout page option) produces an
 * identically formatted message — never duplicate this formatting inline.
 */
export function buildWhatsAppOrderMessage(input: BuildWhatsAppOrderMessageInput): string {
  const { customer, items, totals, preferredPayment, reference } = input;

  const itemLines = items.map((item) => `• ${item.name} ×${item.quantity} — ${formatKES(item.lineTotal)}`);

  const lines = [
    "Hello Safety Hub,",
    "",
    "I would like to place an order.",
    "",
    "Customer Information",
    "--------------------",
    `Name: ${customer.name}`,
    `Phone: ${customer.phone}`,
    ...(customer.email ? [`Email: ${customer.email}`] : []),
    "",
    "Delivery Address",
    "----------------",
    customer.address,
    "",
    "Items",
    "-----",
    ...itemLines,
    "",
    `Subtotal: ${formatKES(totals.subtotal)}`,
    `Shipping: ${totals.shippingFee === 0 ? "Free" : formatKES(totals.shippingFee)}`,
    `VAT (16%): ${formatKES(totals.tax)}`,
    `Total: ${formatKES(totals.total)}`,
    "",
    "Preferred Payment:",
    preferredPayment === "mpesa" ? "M-Pesa" : "Cash on Delivery",
    "",
    `Reference: ${reference}`,
    "",
    "Please confirm availability.",
    "",
    "Thank you.",
  ];

  return lines.join("\n");
}

/** Digits-only business WhatsApp number from `NEXT_PUBLIC_WHATSAPP_NUMBER`, or null if unset/invalid. */
export function getWhatsAppBusinessNumber(): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 9 ? digits : null;
}

/** Builds the `wa.me` deep link, or null if the business number isn't configured. */
export function buildWhatsAppLink(message: string): string | null {
  const number = getWhatsAppBusinessNumber();
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export type OpenWhatsAppCheckoutResult = { ok: true } | { ok: false; error: string };

/**
 * Opens WhatsApp (a new tab on desktop; the WhatsApp app itself on mobile,
 * since `wa.me` handles that redirect natively) with the given message
 * pre-filled. Returns `{ ok: false }` with a friendly error instead of
 * throwing, so callers can show it directly in a toast.
 */
export function openWhatsAppCheckout(message: string): OpenWhatsAppCheckoutResult {
  const link = buildWhatsAppLink(message);

  if (!link) {
    return {
      ok: false,
      error: "WhatsApp ordering isn't set up yet. Please use M-Pesa or Cash on Delivery instead.",
    };
  }

  if (typeof window !== "undefined") {
    window.open(link, "_blank", "noopener,noreferrer");
  }

  return { ok: true };
}
