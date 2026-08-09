// store/server-cart-store.ts
import { create } from "zustand";
import { storeCartService } from "@/services/storefront/store-cart.service";
import type { StoreCart } from "@/types/storefront/store-cart";

interface ServerCartState {
  cart: StoreCart;
  loading: boolean;
  mutating: boolean;
  error: Error | null;
  hasLoaded: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<StoreCart>;
  updateItem: (productId: string, quantity: number) => Promise<StoreCart>;
  removeItem: (productId: string) => Promise<StoreCart>;
  clear: () => Promise<StoreCart>;
}

const initialCart: StoreCart = {
  id: "",
  items: [],
  itemCount: 0,
  subtotal: 0,
};

export const useServerCartStore = create<ServerCartState>((set) => ({
  cart: initialCart,
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
        error: error instanceof Error ? error : new Error("Failed to load cart"), 
        loading: false,
        hasLoaded: true,
      });
    }
  },

  addItem: async (productId: string, quantity = 1) => {
    set({ mutating: true, error: null });
    try {
      const updatedCart = await storeCartService.addItem(productId, quantity);
      set({ cart: updatedCart, mutating: false });
      return updatedCart;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error("Failed to add item"), 
        mutating: false 
      });
      throw error;
    }
  },

  updateItem: async (productId: string, quantity: number) => {
    set({ mutating: true, error: null });
    try {
      const updatedCart = await storeCartService.updateItem(productId, quantity);
      set({ cart: updatedCart, mutating: false });
      return updatedCart;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error("Failed to update item"), 
        mutating: false 
      });
      throw error;
    }
  },

  removeItem: async (productId: string) => {
    set({ mutating: true, error: null });
    try {
      const updatedCart = await storeCartService.removeItem(productId);
      set({ cart: updatedCart, mutating: false });
      return updatedCart;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error("Failed to remove item"), 
        mutating: false 
      });
      throw error;
    }
  },

  clear: async () => {
    set({ mutating: true, error: null });
    try {
      const updatedCart = await storeCartService.clear();
      set({ cart: updatedCart, mutating: false });
      return updatedCart;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error("Failed to clear cart"), 
        mutating: false 
      });
      throw error;
    }
  },
}));