"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FaXmark, FaMinus, FaPlus, FaTrash } from "react-icons/fa6";
import { toast } from "sonner";

import { SafeImage } from "@/components/shared/SafeImage";
import { Button } from "@/components/ui/button";
import { formatKES } from "@/lib/format";
import { useCart } from "@/hooks/useCart";
import { useCartUIStore } from "@/store/cart-ui-store";
import EmptyCart from "./EmptyCart";

export default function CartDrawer() {
  const isOpen = useCartUIStore((s) => s.isOpen);
  const closeCart = useCartUIStore((s) => s.closeCart);

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
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 24,
            }}
            className="fixed right-0 top-0 z-[70] flex h-screen w-full max-w-sm flex-col bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">Cart</h2>

                <span className="text-xs text-muted-foreground">
                  ({items.length})
                </span>
              </div>

              <button
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
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
                    const atMaxStock =
                      !item.unavailable && item.quantity >= item.stock;

                    return (
                      <div
                        key={item.productId}
                        className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-2 shadow-sm"
                      >
                        {/* Image */}
                        <Link
                          href={
                            item.unavailable
                              ? "#"
                              : `/products/${item.productId}`
                          }
                          className="shrink-0"
                          onClick={(e) => {
                            if (item.unavailable) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <div className="relative h-12 w-12 overflow-hidden rounded bg-gray-50">
                            <SafeImage
                              src={item.image}
                              alt={item.name}
                              fill
                              preset="thumbnail"
                              className="object-contain p-1"
                              sizes="48px"
                            />
                          </div>
                        </Link>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <Link
                            href={
                              item.unavailable
                                ? "#"
                                : `/products/${item.productId}`
                            }
                            onClick={(e) => {
                              if (item.unavailable) {
                                e.preventDefault();
                              }
                            }}
                          >
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
                              {/* Decrease */}
                              <button
                                type="button"
                                onClick={() =>
                                  updateItem(
                                    item.productId,
                                    Math.max(1, item.quantity - 1)
                                  ).catch((err) =>
                                    toast.error(
                                      err instanceof Error
                                        ? err.message
                                        : "Could not update quantity"
                                    )
                                  )
                                }
                                disabled={
                                  mutating || item.quantity <= 1
                                }
                                aria-label={`Decrease ${item.name} quantity`}
                                className="flex h-5 w-5 items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                              >
                                <FaMinus className="h-2 w-2" />
                              </button>

                              {/* Quantity */}
                              <span className="w-5 text-center text-[10px] font-medium">
                                {item.quantity}
                              </span>

                              {/* Increase */}
                              <button
                                type="button"
                                onClick={() =>
                                  updateItem(
                                    item.productId,
                                    item.quantity + 1
                                  ).catch((err) =>
                                    toast.error(
                                      err instanceof Error
                                        ? err.message
                                        : "Could not update quantity"
                                    )
                                  )
                                }
                                disabled={mutating || atMaxStock}
                                aria-label={`Increase ${item.name} quantity`}
                                className="flex h-5 w-5 items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                              >
                                <FaPlus className="h-2 w-2" />
                              </button>
                            </div>
                          )}

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() =>
                              removeItem(item.productId)
                                .then(() => toast.success("Removed"))
                                .catch((err) =>
                                  toast.error(
                                    err instanceof Error
                                      ? err.message
                                      : "Could not remove item"
                                  )
                                )
                            }
                            disabled={mutating}
                            aria-label={`Remove ${item.name} from cart`}
                            className="p-1 text-muted-foreground transition hover:text-red-500 disabled:opacity-40"
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
                {/* Summary */}
                <div className="space-y-0.5 text-xs">
                  {/* Subtotal */}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Subtotal
                    </span>

                    <span className="font-medium">
                      {formatKES(subtotal)}
                    </span>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Shipping
                    </span>

                    <span className="font-medium">
                      {shippingFee === 0
                        ? "Free"
                        : formatKES(shippingFee)}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between border-t border-gray-200 pt-1 text-sm font-semibold">
                    <span>Total</span>

                    <span>{formatKES(total)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 flex flex-col gap-1.5">
                  {/* View Cart */}
                  <Button
                    className="h-8 w-full text-xs"
                    nativeButton={false}
                    render={
                      <Link
                        href="/cart"
                        onClick={closeCart}
                      />
                    }
                  >
                    View Cart
                  </Button>

                  {/* Checkout */}
                  <Button
                    variant="outline"
                    className="h-8 w-full gap-1.5 text-xs"
                    nativeButton={false}
                    render={
                      <Link
                        href="/checkout"
                        onClick={closeCart}
                      />
                    }
                  >
                    <span className="h-3 w-3">🔒</span>
                    Checkout
                  </Button>

                  {/* Clear Cart */}
                  <Button
                    variant="ghost"
                    className="h-7 w-full text-[10px] text-muted-foreground"
                    onClick={() =>
                      clear()
                        .then(() => toast.success("Cleared"))
                        .catch((err) =>
                          toast.error(
                            err instanceof Error
                              ? err.message
                              : "Could not clear cart"
                          )
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