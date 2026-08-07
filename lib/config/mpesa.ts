/**
 * Presentation-facing M-Pesa configuration for the storefront checkout.
 *
 * This controls what the `MpesaPaymentCard` shows to shoppers — Paybill vs
 * Till, and the business number/name printed on the card. It is
 * intentionally separate from the server-side Daraja STK Push credentials
 * in `lib/mpesa.ts` (consumer key/secret, shortcode, passkey), which stay
 * server-only and are never exposed to the browser.
 *
 * Values are read from `NEXT_PUBLIC_*` env vars so they're safe to bundle
 * into client code. Override them in `.env` — do not hardcode business
 * numbers inside components.
 */

export const MPESA_PAYMENT_TYPES = ["paybill", "till"] as const;

export type MpesaPaymentType = (typeof MPESA_PAYMENT_TYPES)[number];

export interface MpesaDisplayConfig {
  /** Whether shoppers pay via Paybill (Lipa na M-Pesa > Paybill) or Till (Buy Goods). */
  type: MpesaPaymentType;
  /** The Paybill or Till number shown on the payment card. */
  businessNumber: string;
  /** Business/shop name shown alongside the number. */
  businessName: string;
}

function readPaymentType(): MpesaPaymentType {
  const value = process.env.NEXT_PUBLIC_MPESA_PAYMENT_TYPE?.trim().toLowerCase();
  return value === "till" ? "till" : "paybill";
}

export const MPESA_CONFIG: MpesaDisplayConfig = {
  type: readPaymentType(),
  businessNumber: process.env.NEXT_PUBLIC_MPESA_BUSINESS_NUMBER?.trim() || "174379",
  businessName: process.env.NEXT_PUBLIC_MPESA_BUSINESS_NAME?.trim() || "Safety Hub",
};

/** Human-friendly label for the configured payment type, e.g. for headings. */
export function getMpesaTypeLabel(type: MpesaPaymentType): string {
  return type === "till" ? "Till / Buy Goods" : "Paybill";
}

/** Label for the number field itself, e.g. "Paybill Number" vs "Till Number". */
export function getMpesaNumberLabel(type: MpesaPaymentType): string {
  return type === "till" ? "Till Number" : "Paybill Number";
}
