"use client";

import { useMemo, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FaXmark } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import EmptyCart from "@/components/cart/EmptyCart";
import CartItem from "@/components/cart/CartItem";
import CheckoutButton from "@/components/cart/CheckoutButton";
import { formatKES } from "@/lib/cart";
import { useCartStore } from "@/store/cart-store";

export default function CartDrawer() {
  const { isOpen, closeCart, items, getSubtotal, getVAT, getTotal, removeFromCart, updateQuantity, clearCart } = useCartStore();

  const subtotal = useMemo(() => getSubtotal(), [getSubtotal]);
  const vat = useMemo(() => getVAT(), [getVAT]);
  const total = useMemo(() => getTotal(), [getTotal]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeCart]);

  const handleRemove = (id: string) => {
    removeFromCart(id);
    toast.success("Product removed from cart");
  };

  const handleQuantityUpdate = (id: string, quantity: number) => {
    updateQuantity(id, quantity);
    toast.success("Quantity updated");
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Cart cleared");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/40"
            onClick={closeCart}
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed right-0 top-0 z-[70] flex h-screen w-full max-w-xl flex-col border-l border-border bg-background shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Shopping Cart</h2>
                <p className="text-sm text-muted-foreground">{items.length} item{items.length === 1 ? "" : "s"}</p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="rounded-full p-2 transition hover:bg-muted"
                aria-label="Close cart"
              >
                <FaXmark className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              {items.length === 0 ? (
                <EmptyCart onContinue={() => closeCart()} />
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      price={item.price}
                      quantity={item.quantity}
                      image={item.image}
                      onUpdateQuantity={handleQuantityUpdate}
                      onRemove={handleRemove}
                      category={item.category}
                    />
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border bg-background/95 p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] sm:p-6">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatKES(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">VAT (16%)</span>
                    <span className="font-medium">{formatKES(vat)}</span>
                  </div>
                  <div className="flex items-center justify-between text-base font-semibold text-foreground">
                    <span>Grand Total</span>
                    <span>{formatKES(total)}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <Link href="/cart" onClick={closeCart}>
                      Continue Shopping
                    </Link>
                  </Button>
                  <CheckoutButton variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700" />
                  <Button type="button" variant="ghost" className="w-full" onClick={handleClearCart}>
                    Clear Cart
                  </Button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
