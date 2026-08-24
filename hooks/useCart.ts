// hooks/useCart.ts
"use client";

import { useEffect } from "react";
import { useServerCartStore } from "@/store/server-cart-store";

export function useCart() {
  const cart = useServerCartStore((state) => state.cart);
  const loading = useServerCartStore((state) => state.loading);
  const mutating = useServerCartStore((state) => state.mutating);
  const error = useServerCartStore((state) => state.error);
  const hasLoaded = useServerCartStore((state) => state.hasLoaded);
  const fetchCart = useServerCartStore((state) => state.fetchCart);
  const addItem = useServerCartStore((state) => state.addItem);
  const updateItem = useServerCartStore((state) => state.updateItem);
  const removeItem = useServerCartStore((state) => state.removeItem);
  const clear = useServerCartStore((state) => state.clear);

  useEffect(() => {
    if (!hasLoaded && !loading) {
      void fetchCart();
    }
  }, [hasLoaded, loading, fetchCart]);

  // shippingFee/tax/total come straight from the server (lib/storefront/cart.ts),
  // computed against the live admin Settings.taxRate — never re-derived here,
  // so a 0% tax rate (or any change) shows up correctly without a stale/guessed rate.
  return {
    cart,
    items: cart.items,
    itemCount: cart.itemCount,
    subtotal: cart.subtotal,
    shippingFee: cart.shippingFee,
    tax: cart.tax,
    taxRatePercent: cart.taxRatePercent,
    total: cart.total,
    loading,
    mutating,
    error,
    refresh: fetchCart,
    addItem,
    updateItem,
    removeItem,
    clear,
  };
}