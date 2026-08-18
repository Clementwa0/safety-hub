"use client";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaArrowLeft, FaBagShopping} from "react-icons/fa6";
import { toast } from "sonner";

import CartItem from "./components/CartItem";
import CartSummary from "./components/CartSummary";
import EmptyCart from "./components/EmptyCart";
import { Loading } from "@/components/shared/Loading";
import { useCart } from "@/hooks/useCart";
import { motion } from "framer-motion";

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    shippingFee,
    tax,
    total,
    loading,
    mutating,
    updateItem,
    removeItem,
    clear,
  } = useCart();

  if (loading && items.length === 0) {
    return <Loading label="Loading your cart..." className="py-24" />;
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-all hover:text-primary"
            >
              <FaArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Continue Shopping
            </Link>
            <h1 className="mt-4 flex items-center gap-3 text-2xl font-bold text-foreground sm:text-3xl">
              <FaBagShopping className="h-7 w-7 text-primary" />
              Your Cart
              <span className="ml-2 rounded-full bg-primary/10 px-3 py-0.5 text-sm font-medium text-primary">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </h1>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={() => {
                clear().then(() => {
                  toast.success("Cart cleared");
                }).catch((error) => {
                  toast.error(error instanceof Error ? error.message : "Could not clear cart");
                });
              }}
              disabled={mutating}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-destructive transition-all hover:bg-destructive/10 disabled:opacity-50"
            >
              Clear Cart
            </button>
          )}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          {/* Cart Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-border/50 bg-white/80 shadow-sm backdrop-blur-sm"
          >
            <div className="hidden border-b border-border/50 px-6 py-4 text-sm font-medium text-muted-foreground sm:grid sm:grid-cols-[3fr_1fr_1fr_0.5fr]">
              <span>Product</span>
              <span className="text-center">Quantity</span>
              <span className="text-right">Total</span>
              <span className="text-right">Action</span>
            </div>

            <div className="divide-y divide-border/50">
              <AnimatePresence mode="wait">
                {items.map((item) => (
                  <CartItem
                    key={item.id} // Using unique cart item ID
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
                    onUpdateQuantity={(id, qty) => {
                      updateItem(id, qty).catch((error) => {
                        toast.error(error instanceof Error ? error.message : "Could not update quantity");
                      });
                    }}
                    onRemove={(id) => {
                      removeItem(id).then(() => {
                        toast.success("Product removed from cart");
                      }).catch((error) => {
                        toast.error(error instanceof Error ? error.message : "Could not remove item");
                      });
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <CartSummary
              subtotal={subtotal}
              shippingFee={shippingFee}
              tax={tax}
              total={total}
              itemCount={itemCount}
              onClear={() => {
                clear().then(() => {
                  toast.success("Cart cleared");
                }).catch((error) => {
                  toast.error(error instanceof Error ? error.message : "Could not clear cart");
                });
              }}
              clearing={mutating}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}