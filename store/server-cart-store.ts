import { create } from "zustand";
import { storeCartService } from "@/services/store-cart.service";
import type { StoreCart } from "@/types/store-cart";

const EMPTY_CART: StoreCart = { id: "", items: [], itemCount: 0, subtotal: 0 };

interface ServerCartStore {
  cart: StoreCart;
  loading: boolean;
  mutating: boolean;
  error: string | null;
  hasLoaded: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
}

export const useServerCartStore = create<ServerCartStore>((set, get) => ({
  cart: EMPTY_CART,
  loading: false,
  mutating: false,
  error: null,
  hasLoaded: false,

  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const cart = await storeCartService.get();
      set({ cart, loading: false, hasLoaded: true });
    } catch (error) {
      set({
        loading: false,
        hasLoaded: true,
        error: error instanceof Error ? error.message : "Failed to load cart",
      });
    }
  },

  addItem: async (productId, quantity = 1) => {
    set({ mutating: true, error: null });
    try {
      const cart = await storeCartService.addItem(productId, quantity);
      set({ cart, mutating: false });
    } catch (error) {
      set({ mutating: false, error: error instanceof Error ? error.message : "Failed to add item" });
      throw error;
    }
  },

  updateItem: async (productId, quantity) => {
    set({ mutating: true, error: null });
    try {
      const cart = await storeCartService.updateItem(productId, quantity);
      set({ cart, mutating: false });
    } catch (error) {
      set({ mutating: false, error: error instanceof Error ? error.message : "Failed to update quantity" });
      throw error;
    }
  },

  removeItem: async (productId) => {
    set({ mutating: true, error: null });
    try {
      const cart = await storeCartService.removeItem(productId);
      set({ cart, mutating: false });
    } catch (error) {
      set({ mutating: false, error: error instanceof Error ? error.message : "Failed to remove item" });
      throw error;
    }
  },

  clear: async () => {
    set({ mutating: true, error: null });
    try {
      const cart = await storeCartService.clear();
      set({ cart, mutating: false });
    } catch (error) {
      set({ mutating: false, error: error instanceof Error ? error.message : "Failed to clear cart" });
      throw error;
    }
  },
}));
