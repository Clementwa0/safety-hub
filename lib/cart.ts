import type { CartProduct } from "@/store/cart-store";
import { formatKES } from "@/lib/format";

const VAT_RATE = 0.16;

export { formatKES };

export function calculateSubtotal(items: Array<{ price: number; quantity: number }>): number {
  return Number(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
  );
}

export function calculateVAT(subtotal: number): number {
  return Number((subtotal * VAT_RATE).toFixed(2));
}

export function calculateTotal(subtotal: number): number {
  return Number((subtotal + calculateVAT(subtotal)).toFixed(2));
}

export function generateWhatsAppMessage(items: Array<{ name: string; quantity: number; price: number }>, subtotal: number, vat: number, total: number): string {
  const lines = items.map((item, index) => {
    const itemSubtotal = item.price * item.quantity;
    return `${index + 1}. ${item.name}\n   Quantity: ${item.quantity}\n   Unit Price: ${formatKES(item.price)}\n   Subtotal: ${formatKES(itemSubtotal)}`;
  });

  return `Hello,\n\nI would like to request a quotation for the following PPE products:\n\n${lines.join("\n\n")}\n\n--------------------------------\n\nSubtotal: ${formatKES(subtotal)}\nVAT (16%): ${formatKES(vat)}\nGrand Total: ${formatKES(total)}\n\nPlease share the quotation and availability.\n\nThank you.`;
}

export function toCartProduct(product: { id: string; name: string; slug?: string; image: string | { src: string }; price: number; category: string }): CartProduct {
  const image = typeof product.image === "string" ? product.image : product.image.src;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug ?? product.id,
    image,
    price: product.price,
    category: product.category,
  };
}
