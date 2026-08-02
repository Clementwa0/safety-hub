"use client";

import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import { toast } from "sonner";

import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import EmptyCart from "./EmptyCart";
import { Loading } from "@/components/shared/Loading";
import { useCart } from "@/hooks/useCart";

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

  const handleQuantityUpdate = async (productId: string, quantity: number) => {
    try {
      await updateItem(productId, quantity);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update quantity");
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeItem(productId);
      toast.success("Product removed from cart");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove item");
    }
  };

  const handleClear = async () => {
    try {
      await clear();
      toast.success("Cart cleared");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not clear cart");
    }
  };

  if (loading && items.length === 0) {
    return <Loading label="Loading your cart..." className="py-24" />;
  }

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
            </AnimatePresence>
          </div>
        </div>

        <CartSummary
          subtotal={subtotal}
          shippingFee={shippingFee}
          tax={tax}
          total={total}
          itemCount={itemCount}
          onClear={() => void handleClear()}
          clearing={mutating}
        />
      </div>
    </div>
  );
}
