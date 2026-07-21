import { formatKES, Product } from "@/data/products";

// Replace with your actual business WhatsApp number (international format, no +)
export const WHATSAPP_NUMBER = "254115062024";
export const BUSINESS_NAME = "ShieldPro Safety";
export const BUSINESS_EMAIL = "sales@shieldpro.co.ke";
export const BUSINESS_PHONE = "+254 115 062 024";
export const BUSINESS_LOCATION = "Industrial Area, Nairobi, Kenya";

export type CartLine = { product: Product; qty: number };

export function buildOrderMessage(lines: CartLine[]) {
  const items = lines
    .map(
      (l) =>
        `• ${l.product.name} ×${l.qty} — ${formatKES(l.product.price * l.qty)}`,
    )
    .join("\n");
  const total = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  return `Hello ${BUSINESS_NAME}, I would like to place an order:\n\n${items}\n\nTotal: ${formatKES(total)}\n\nName: \nLocation: `;
}

export function buildInquiryMessage(product: Product) {
  return `Hello ${BUSINESS_NAME}, I'd like to inquire about:\n\n• ${product.name} — ${formatKES(product.price)}\n\nCould you share more details and availability?`;
}

export function buildQuotationMessage(lines: CartLine[]) {
  const items = lines
    .map((l) => `• ${l.product.name} ×${l.qty}`)
    .join("\n");
  return `Hello ${BUSINESS_NAME}, please send me a formal quotation for:\n\n${items}\n\nCompany: \nContact person: \nDelivery location: `;
}

export function waLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
