export interface LineItem {
  id: string;
  productId?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // percentage e.g. 16
  discount: number; // percentage e.g. 0-100
}

export interface Customer {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
}

export interface DocumentTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}
