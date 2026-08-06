// hooks/useCart.ts
"use client";

import { useEffect } from "react";
import { useServerCartStore } from "@/store/server-cart-store";
import { calculateShippingFee, calculateTax, calculateTotal } from "@/lib/storefront/pricing";

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

  const shippingFee = calculateShippingFee(cart.subtotal);
  const tax = calculateTax(cart.subtotal);
  const total = calculateTotal(cart.subtotal, shippingFee, tax);

  return {
    cart,
    items: cart.items,
    itemCount: cart.itemCount,
    subtotal: cart.subtotal,
    shippingFee,
    tax,
    total,
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