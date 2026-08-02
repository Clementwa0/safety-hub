"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FaXmark } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import EmptyCart from "@/components/cart/EmptyCart";
import CartItem from "@/components/cart/CartItem";
import CheckoutButton from "@/components/cart/CheckoutButton";
import { formatKES } from "@/lib/format";
import { useCart } from "@/hooks/useCart";
import { useCartUIStore } from "@/store/cart-ui-store";

export default function CartDrawer() {
  const isOpen = useCartUIStore((state) => state.isOpen);
  const closeCart = useCartUIStore((state) => state.closeCart);

  const {
    items,
    subtotal,
    shippingFee,
    tax,
    total,
    mutating,
    updateItem,
    removeItem,
    clear,
  } = useCart();

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

  const handleRemove = async (productId: string) => {
    try {
      await removeItem(productId);
      toast.success("Product removed from cart");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove item");
    }
  };

  const handleQuantityUpdate = async (productId: string, quantity: number) => {
    try {
      await updateItem(productId, quantity);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update quantity");
    }
  };

  const handleClearCart = async () => {
    try {
      await clear();
      toast.success("Cart cleared");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not clear cart");
    }
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
                <h2 className="text-lg font-semibold text-foreground">
                  Shopping Cart
                </h2>
                <p className="text-sm text-muted-foreground">
                  {items.length} item{items.length === 1 ? "" : "s"}
                </p>
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
                      key={item.productId}
                      productId={item.productId}
                      name={item.name}
                      price={item.price}
                      quantity={item.quantity}
                      image={item.image}
                      category={item.category}
                      stock={item.stock}
                      unavailable={item.unavailable}
                      unavailableReason={item.unavailableReason}
                      disabled={mutating}
                      onUpdateQuantity={(id, qty) => void handleQuantityUpdate(id, qty)}
                      onRemove={(id) => void handleRemove(id)}
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
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">{shippingFee === 0 ? "Free" : formatKES(shippingFee)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">VAT (16%)</span>
                    <span className="font-medium">{formatKES(tax)}</span>
                  </div>
                  <div className="flex items-center justify-between text-base font-semibold text-foreground">
                    <span>Grand Total</span>
                    <span>{formatKES(total)}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <Button
                    className="w-full"
                    nativeButton={false}
                    render={<Link href="/cart" onClick={closeCart} />}
                  >
                    View Cart
                  </Button>
                  <CheckoutButton variant="outline" />
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => void handleClearCart()}
                    disabled={mutating}
                  >
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
