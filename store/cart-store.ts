import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  category: string;
}

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  category: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getVAT: () => number;
  getTotal: () => number;
  isInCart: (id: string) => boolean;
}

const roundCurrency = (value: number) => Number(value.toFixed(2));

const cartStorage = {
  getItem: (name: string) => {
    if (typeof window === "undefined") {
      return null;
    }

    const value = window.localStorage.getItem(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name: string, value: unknown) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(name, JSON.stringify(value));
    }
  },
  removeItem: (name: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(name);
    }
  },
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addToCart: (product) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...product,
                quantity: 1,
              },
            ],
          };
        });
      },

      removeFromCart: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      increaseQuantity: (id) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        }));
      },

      decreaseQuantity: (id) => {
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item,
            )
            .filter((item) => item.quantity > 0),
        }));
      },

      updateQuantity: (id, quantity) => {
        const normalizedQuantity = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: normalizedQuantity } : item,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getItemCount: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        const subtotal = get().items.reduce((total, item) => total + item.price * item.quantity, 0);
        return roundCurrency(subtotal);
      },

      getVAT: () => roundCurrency(get().getSubtotal() * 0.16),

      getTotal: () => roundCurrency(get().getSubtotal() + get().getVAT()),

      isInCart: (id) => get().items.some((item) => item.id === id),
    }),
    {
      name: "hse-hub-cart",
      storage: cartStorage as typeof cartStorage,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
