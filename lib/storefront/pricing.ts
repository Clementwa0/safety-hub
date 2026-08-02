/**
 * All pricing math the checkout depends on lives here, on the server.
 * The frontend never sends price, subtotal, shipping, tax, or total —
 * it only ever displays what these functions returned.
 */

// Matches the VAT rate already used across quotations/invoices in this app.
export const TAX_RATE = 0.16;

const FLAT_SHIPPING_FEE = 500;
const FREE_SHIPPING_THRESHOLD = 10000;

const round = (value: number) => Math.round(value * 100) / 100;

export function calculateSubtotal(items: Array<{ price: number; quantity: number }>): number {
  return round(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
}

export function calculateShippingFee(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
}

export function calculateTax(subtotal: number): number {
  return round(subtotal * TAX_RATE);
}

export function calculateTotal(subtotal: number, shippingFee: number, tax: number): number {
  return round(subtotal + shippingFee + tax);
}
