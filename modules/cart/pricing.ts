/**
 * All pricing math the checkout depends on lives here, on the server.
 * The frontend never sends price, subtotal, shipping, tax, or total -
 * it only ever displays what these functions returned.
 */

const FLAT_SHIPPING_FEE = 500;
export const FREE_SHIPPING_THRESHOLD = 10000;

const round = (value: number) => Math.round(value * 100) / 100;

export function calculateSubtotal(items: Array<{ price: number; quantity: number }>): number {
  return round(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
}

export function calculateShippingFee(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
}

/**
 * `taxRatePercent` is the admin-configured Settings.taxRate (0-100, e.g.
 * 16 for 16%) - always pass it explicitly, never assume a rate here.
 * A rate of 0 is a completely valid, intentional "no tax" configuration
 * and must round to exactly 0, not fall back to any default.
 */
export function calculateTax(subtotal: number, taxRatePercent: number): number {
  return round(subtotal * (taxRatePercent / 100));
}

export function calculateTotal(subtotal: number, shippingFee: number, tax: number): number {
  return round(subtotal + shippingFee + tax);
}
