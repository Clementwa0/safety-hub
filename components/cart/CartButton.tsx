"use client";

import { FaCartShopping } from "react-icons/fa6";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cart-store";

interface CartButtonProps {
  className?: string;
}

export default function CartButton({ className = "" }: CartButtonProps) {
  const itemCount = useCartStore((state) => state.getItemCount());
  const openCart = useCartStore((state) => state.openCart);

  return (
    <button
      type="button"
      onClick={openCart}
      className={`relative ${className}`.trim()}
      aria-label={`Open cart with ${itemCount} items`}
    >
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
        <FaCartShopping className="h-5 w-5 text-primary transition-colors hover:text-secondary" />
        {itemCount > 0 && (
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
