// components/cart/CartDrawer.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FaXmark, FaMinus, FaPlus, FaTrash } from "react-icons/fa6";
import { toast } from "sonner";

import { SafeImage } from "@/components/shared/SafeImage";
import { Button } from "@/components/ui/button";
import EmptyCart from "@/components/cart/EmptyCart";
import { formatKES } from "@/lib/format";
import { useCart } from "@/hooks/useCart";
import { useCartUIStore } from "@/store/cart-ui-store";

export default function CartDrawer() {
  const isOpen = useCartUIStore((s) => s.isOpen);
  const closeCart = useCartUIStore((s) => s.closeCart);
  const { items, subtotal, shippingFee, tax, total, mutating, updateItem, removeItem, clear } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40"
            onClick={closeCart}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed right-0 top-0 z-[70] flex h-screen w-full max-w-sm flex-col bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">Cart</h2>
                <span className="text-xs text-muted-foreground">({items.length})</span>
              </div>
              <button
                onClick={closeCart}
                className="rounded-full p-1.5 transition hover:bg-gray-100"
              >
                <FaXmark className="h-4 w-4" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {items.length === 0 ? (
                <EmptyCart onContinue={closeCart} />
              ) : (
                <div className="space-y-2">
                  {items.map((item) => {
                    const atMaxStock = !item.unavailable && item.quantity >= item.stock;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg bg-white p-2 shadow-sm border border-gray-100"
                      >
                        {/* Image */}
                        <Link
                          href={item.unavailable ? "#" : `/products/${item.productId}`}
                          className="shrink-0"
                        >
                          <div className="relative h-12 w-12 overflow-hidden rounded bg-gray-50">
                            <SafeImage
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-contain p-1"
                              sizes="48px"
                            />
                          </div>
                        </Link>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <Link href={item.unavailable ? "#" : `/products/${item.productId}`}>
                            <p className="truncate text-xs font-medium text-foreground hover:text-secondary">
                              {item.name}
                            </p>
                          </Link>
                          <p className="text-[10px] text-muted-foreground">
                            {formatKES(item.price)}
                          </p>
                          {item.unavailable && (
                            <p className="text-[9px] text-destructive">
                              {item.unavailableReason ?? "Unavailable"}
                            </p>
                          )}
                        </div>

                        {/* Quantity + Remove */}
                        <div className="flex items-center gap-1.5">
                          {!item.unavailable && (
                            <div className="flex items-center rounded border border-gray-200 text-[10px]">
                              <button
                                onClick={() =>
                                  updateItem(item.productId, Math.max(1, item.quantity - 1)).catch(
                                    (err) =>
                                      toast.error(
                                        err instanceof Error ? err.message : "Could not update quantity"
                                      )
                                  )
                                }
                                disabled={mutating || item.quantity <= 1}
                                className="flex h-5 w-5 items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                              >
                                <FaMinus className="h-2 w-2" />
                              </button>
                              <span className="w-5 text-center text-[10px] font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateItem(item.productId, item.quantity + 1).catch((err) =>
                                    toast.error(
                                      err instanceof Error ? err.message : "Could not update quantity"
                                    )
                                  )
                                }
                                disabled={mutating || atMaxStock}
                                className="flex h-5 w-5 items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                              >
                                <FaPlus className="h-2 w-2" />
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() =>
                              removeItem(item.productId)
                                .then(() => toast.success("Removed"))
                                .catch((err) =>
                                  toast.error(
                                    err instanceof Error ? err.message : "Could not remove item"
                                  )
                                )
                            }
                            disabled={mutating}
                            className="p-1 text-muted-foreground hover:text-red-500 disabled:opacity-40"
                          >
                            <FaTrash className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t bg-gray-50 px-4 py-3">
                <div className="space-y-0.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatKES(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {shippingFee === 0 ? "Free" : formatKES(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-1 text-sm font-semibold">
                    <span>Total</span>
                    <span>{formatKES(total)}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-1.5">
                  <Button
                    className="w-full h-8 text-xs"
                    nativeButton={false}
                    render={<Link href="/cart" onClick={closeCart} />}
                  >
                    View Cart
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-8 gap-1.5 text-xs"
                    nativeButton={false}
                    render={<Link href="/checkout" />}
                  >
                    <span className="h-3 w-3">🔒</span> Checkout
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full h-7 text-[10px] text-muted-foreground"
                    onClick={() =>
                      clear()
                        .then(() => toast.success("Cleared"))
                        .catch((err) =>
                          toast.error(err instanceof Error ? err.message : "Could not clear cart")
                        )
                    }
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