export interface StoreCartItem {
  productId: string;
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
}
