export interface StoreCartItem {
  id: string; // Unique cart item ID
  productId: string;
  /** SKU of the selected variant (e.g. size). Undefined for simple products. */
  variantSku?: string;
  /** Selected size label, when this line is a variant. */
  size?: string;
  /** Effective SKU shown to the shopper: the variant SKU, or the product SKU. */
  sku?: string;
  name: string;
  slug: string;
  image: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "out_of_stock" | "archived";
  quantity: number;
  subtotal: number;
  unavailable: boolean;
  unavailableReason?: string;
}

export interface StoreCart {
  id: string;
  items: StoreCartItem[];
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  tax: number;
  /** Admin-configured Settings.taxRate (0-100) this cart's `tax` was computed with. */
  taxRatePercent: number;
  total: number;
}