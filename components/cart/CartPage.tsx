"use client";

import { useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import { toast } from "sonner";

import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import EmptyCart from "./EmptyCart";
import { useCartStore } from "@/store/cart-store";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const vat = useCartStore((state) => state.getVAT());
  const total = useCartStore((state) => state.getTotal());

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const handleQuantityUpdate = (id: string, quantity: number) => {
    updateQuantity(id, quantity);
    toast.success("Quantity updated");
  };

  const handleRemove = (id: string) => {
    removeFromCart(id);
    toast.success("Product removed from cart");
  };

  const handleClear = () => {
    clearCart();
    toast.success("Cart cleared");
  };

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary">
        <FaArrowLeft className="h-4 w-4" />
        Continue Shopping
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Cart ({itemCount} items)</h2>
          <div className="rounded-3xl border border-border bg-card/60 p-4 shadow-sm">
            <AnimatePresence>
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  price={item.price}
                  quantity={item.quantity}
                  image={item.image}
                  category={item.category}
                  onUpdateQuantity={handleQuantityUpdate}
                  onRemove={handleRemove}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        <CartSummary subtotal={subtotal} vat={vat} total={total} itemCount={itemCount} onClear={handleClear} />
      </div>
    </div>
  );
}