"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaXmark,
  FaMinus,
  FaPlus,
  FaTrash,
  FaLock,
  FaTruck,
  FaCircleCheck,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { toast } from "sonner";

import { SafeImage } from "@/components/shared/SafeImage";
import { Button } from "@/components/ui/button";
import { formatKES } from "@/lib/format";
import { useCart } from "@/hooks/useCart";
import { useCartUIStore } from "@/store/cart-ui-store";
import { FREE_SHIPPING_THRESHOLD } from "@/modules/cart/pricing";
import EmptyCart from "./EmptyCart";

export default function CartDrawer() {
  const isOpen = useCartUIStore((s) => s.isOpen);
  const closeCart = useCartUIStore((s) => s.closeCart);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const {
    items,
    itemCount,
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
    // Land keyboard focus in the drawer as soon as it's open, so Escape
    // and Tab work immediately instead of still targeting whatever was
    // focused on the page underneath.
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeCart]);

  // Free-shipping nudge: how close is this cart to the flat-fee threshold.
  // Sourced from the same constant the server prices against, so this
  // never drifts out of sync with what checkout actually charges.
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const hasFreeShipping = subtotal > 0 && amountToFreeShipping === 0;
  const shippingProgress = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-primary/40 backdrop-blur-[2px]"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="fixed right-0 top-0 z-[70] flex h-screen w-full max-w-sm flex-col bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div className="flex items-baseline gap-2">
                <h2 className="font-display text-lg font-bold text-primary">
                  Your Cart
                </h2>

                {itemCount > 0 && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </span>
                )}
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <FaXmark className="h-4 w-4" />
              </button>
            </div>

            {/* Free shipping nudge */}
            {items.length > 0 && (
              <div className="border-b border-border/60 bg-muted/40 px-5 py-3">
                {hasFreeShipping ? (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-secondary">
                    <FaCircleCheck className="h-3.5 w-3.5 shrink-0" />
                    You&apos;ve unlocked free shipping
                  </p>
                ) : (
                  <>
                    <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <FaTruck className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      Add {formatKES(amountToFreeShipping)} more for free
                      shipping
                    </p>

                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border/70">
                      <motion.div
                        className="h-full rounded-full bg-secondary"
                        initial={false}
                        animate={{ width: `${shippingProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {items.length === 0 ? (
                <EmptyCart onContinue={closeCart} />
              ) : (
                <div className="space-y-2.5">
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const safeStock = Math.max(0, item.stock);
                      const atMaxStock =
                        !item.unavailable &&
                        safeStock > 0 &&
                        item.quantity >= safeStock;
                      const isOutOfStock = !item.unavailable && safeStock <= 0;

                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex gap-3 rounded-xl border border-border/60 bg-white p-3"
                        >
                          {/* Image */}
                          <Link
                            href={
                              item.unavailable
                                ? "#"
                                : `/products/${item.productId}`
                            }
                            onClick={(e) => {
                              if (item.unavailable) e.preventDefault();
                              else closeCart();
                            }}
                            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted"
                            aria-hidden={item.unavailable}
                            tabIndex={item.unavailable ? -1 : undefined}
                          >
                            <SafeImage
                              src={item.image}
                              alt={item.name}
                              fill
                              preset="thumbnail"
                              className={
                                item.unavailable
                                  ? "object-contain p-2 opacity-50"
                                  : "object-contain p-2"
                              }
                              sizes="64px"
                            />
                          </Link>

                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <Link
                                  href={
                                    item.unavailable
                                      ? "#"
                                      : `/products/${item.productId}`
                                  }
                                  onClick={(e) => {
                                    if (item.unavailable) e.preventDefault();
                                    else closeCart();
                                  }}
                                  className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  tabIndex={item.unavailable ? -1 : undefined}
                                >
                                  <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                                    {item.name}
                                  </p>
                                </Link>

                                {item.size && (
                                  <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                    Size {item.size}
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removeItem(item.productId, item.variantSku)
                                    .then(() => toast.success("Removed from cart"))
                                    .catch((err) =>
                                      toast.error(
                                        err instanceof Error
                                          ? err.message
                                          : "Could not remove item",
                                      ),
                                    )
                                }
                                disabled={mutating}
                                aria-label={`Remove ${item.name} from cart`}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-40"
                              >
                                <FaTrash className="h-3 w-3" />
                              </button>
                            </div>

                            {item.unavailable ? (
                              <p className="mt-1.5 flex items-start gap-1 text-xs font-medium text-destructive">
                                <FaTriangleExclamation className="mt-0.5 h-3 w-3 shrink-0" />
                                {item.unavailableReason ?? "No longer available"}
                              </p>
                            ) : (
                              <div className="mt-2 flex items-center justify-between gap-2">
                                <div className="flex items-center rounded-lg border border-border">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateItem(
                                        item.productId,
                                        item.variantSku,
                                        Math.max(1, item.quantity - 1),
                                      ).catch((err) =>
                                        toast.error(
                                          err instanceof Error
                                            ? err.message
                                            : "Could not update quantity",
                                        ),
                                      )
                                    }
                                    disabled={mutating || item.quantity <= 1}
                                    aria-label={`Decrease ${item.name} quantity`}
                                    className="flex h-7 w-7 items-center justify-center rounded-l-lg transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    <FaMinus className="h-2.5 w-2.5" />
                                  </button>

                                  <span className="w-6 text-center text-xs font-semibold tabular-nums">
                                    {item.quantity}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateItem(
                                        item.productId,
                                        item.variantSku,
                                        item.quantity + 1,
                                      ).catch((err) =>
                                        toast.error(
                                          err instanceof Error
                                            ? err.message
                                            : "Could not update quantity",
                                        ),
                                      )
                                    }
                                    disabled={
                                      mutating || isOutOfStock || atMaxStock
                                    }
                                    aria-label={`Increase ${item.name} quantity`}
                                    className="flex h-7 w-7 items-center justify-center rounded-r-lg transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    <FaPlus className="h-2.5 w-2.5" />
                                  </button>
                                </div>

                                <span className="text-sm font-semibold tabular-nums text-foreground">
                                  {formatKES(item.price * item.quantity)}
                                </span>
                              </div>
                            )}

                            {!item.unavailable && isOutOfStock && (
                              <p className="mt-1.5 text-[11px] font-medium text-destructive">
                                Out of stock
                              </p>
                            )}

                            {!item.unavailable && !isOutOfStock && atMaxStock && (
                              <p className="mt-1.5 text-[11px] font-medium text-accent">
                                Max available stock reached
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border/60 bg-muted/30 px-5 py-4">
                {/* Summary */}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium tabular-nums text-foreground">
                      {formatKES(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span
                      className={
                        shippingFee === 0
                          ? "font-medium text-secondary"
                          : "font-medium tabular-nums text-foreground"
                      }
                    >
                      {shippingFee === 0 ? "Free" : formatKES(shippingFee)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (VAT)</span>
                    <span className="font-medium tabular-nums text-foreground">
                      {formatKES(tax)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline justify-between border-t border-border/70 pt-2">
                    <span className="font-display text-sm font-bold text-foreground">
                      Total
                    </span>
                    <span className="font-display text-lg font-bold tabular-nums text-primary">
                      {formatKES(total)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-col gap-2">
                  <Button
                    className="h-10 w-full gap-1.5"
                    nativeButton={false}
                    render={<Link href="/checkout" onClick={closeCart} />}
                  >
                    <FaLock className="h-3 w-3" />
                    Checkout
                  </Button>

                  <Button
                    variant="outline"
                    className="h-9 w-full"
                    nativeButton={false}
                    render={<Link href="/cart" onClick={closeCart} />}
                  >
                    View Cart
                  </Button>

                  <button
                    type="button"
                    onClick={() =>
                      clear()
                        .then(() => toast.success("Cart cleared"))
                        .catch((err) =>
                          toast.error(
                            err instanceof Error
                              ? err.message
                              : "Could not clear cart",
                          ),
                        )
                    }
                    disabled={mutating}
                    className="mt-0.5 self-center text-xs font-medium text-muted-foreground underline-offset-2 transition hover:text-destructive hover:underline disabled:pointer-events-none disabled:opacity-40"
                  >
                    Clear cart
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
