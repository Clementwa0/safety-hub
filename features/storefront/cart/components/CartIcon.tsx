"use client";

import { useEffect, useState } from "react";
import { FaCartShopping, FaSpinner } from "react-icons/fa6";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { useCart } from "@/hooks/useCart";
import { useCartUIStore } from "@/store/cart-ui-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CartIconProps {
  className?: string;
  disableDrawer?: boolean;
  productId?: string;
  productName?: string;
  /** SKU of the selected variant (e.g. size). Omit for simple products. */
  variantSku?: string;
  quantity?: number;
  disabled?: boolean;
  showText?: boolean;
  variant?: "icon" | "button";
}

export default function CartIcon({ 
  className = "", 
  disableDrawer = false,
  productId,
  productName,
  variantSku,
  quantity = 1,
  disabled = false,
  showText = true,
  variant = "icon",
}: CartIconProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { itemCount, addItem } = useCart();
  const openCart = useCartUIStore((state) => state.openCart);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleAddToCart = async () => {
    if (disabled || !productId) {
      if (disabled) toast.error("This product is out of stock");
      return;
    }

    setLoading(true);
    try {
      await addItem(productId, variantSku, quantity);
      openCart();
      toast.success(`${productName || "Product"} added to cart`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add to cart");
    } finally {
      setLoading(false);
    }
  };

  // Button variant for product page
  if (variant === "button" && productId) {
    return (
      <Button
        onClick={() => void handleAddToCart()}
        disabled={disabled || loading}
        className={cn(
          "flex items-center justify-center gap-2 font-semibold",
          disabled || loading
            ? "cursor-not-allowed bg-gray-300 text-gray-500 hover:bg-gray-300"
            : "bg-slate-700 text-white hover:bg-slate-800",
          className
        )}
      >
        {loading ? (
          <FaSpinner className="h-4 w-4 animate-spin" />
        ) : (
          <FaCartShopping className="h-4 w-4" />
        )}
        {showText && (loading ? "Adding..." : disabled ? "Out of Stock" : "Add to Cart")}
      </Button>
    );
  }

  // Icon variant for header/navigation
  const ariaLabel = isMounted ? `Open cart with ${itemCount} items` : "Open cart";

  const handleClick = () => {
    if (!disableDrawer) {
      openCart();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative ${className}`.trim()}
      aria-label={ariaLabel}
    >
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
        <FaCartShopping className="h-5 w-5 text-primary transition-colors hover:text-secondary" />
        {isMounted && itemCount > 0 && (
          <motion.span
            key={itemCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white"
          >
            {itemCount > 99 ? "99+" : itemCount}
          </motion.span>
        )}
      </motion.div>
    </button>
  );
}