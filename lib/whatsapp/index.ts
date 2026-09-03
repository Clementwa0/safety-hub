import { Product } from "@/types/product";
import { formatKES } from "../format";

/**
 * Pure WhatsApp message/link helpers. Deliberately don't read company info
 * from a module-level constant - callers pass in the business name/number
 * from `useSettings()` so these stay in sync with Sentinel → Settings
 * without needing a page reload.
 */

export function normalizeWhatsAppNumber(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("254")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `254${digits.slice(1)}`;
  }

  return digits;
}

export type CartLine = { product: Product; qty: number };

export function buildOrderMessage(businessName: string, lines: CartLine[]) {
  const items = lines
    .map(
      (l) =>
        `• ${l.product.name} ×${l.qty} - ${formatKES(l.product.price * l.qty)}`,
    )
    .join("\n");
  const total = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  return `Hello ${businessName}, I would like to place an order:\n\n${items}\n\nTotal: ${formatKES(total)}\n\nName: \nLocation: `;
}

export function buildInquiryMessage(businessName: string, product: Product) {
  return `Hello ${businessName}, I'd like to inquire about:\n\n• ${product.name} - ${formatKES(product.price)}\n\nCould you share more details and availability?`;
}

export function buildQuotationMessage(businessName: string, lines: CartLine[]) {
  const items = lines
    .map((l) => `• ${l.product.name} ×${l.qty}`)
    .join("\n");
  return `Hello ${businessName}, please send me a formal quotation for:\n\n${items}\n\nCompany: \nContact person: \nDelivery location: `;
}

export function waLink(message: string, whatsappNumber: string) {
  return `https://wa.me/${normalizeWhatsAppNumber(whatsappNumber)}?text=${encodeURIComponent(message)}`;
}
