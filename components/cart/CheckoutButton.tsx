"use client";

import { FaCommentDots } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { generateWhatsAppMessage } from "@/lib/cart";
import { useCartStore } from "@/store/cart-store";

interface CheckoutButtonProps {
  className?: string;
  variant?: "default" | "outline";
  fullWidth?: boolean;
}

export default function CheckoutButton({
  className = "",
  variant = "default",
  fullWidth = true,
}: CheckoutButtonProps) {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const vat = useCartStore((state) => state.getVAT());
  const total = useCartStore((state) => state.getTotal());

  const handleCheckout = () => {
    if (items.length === 0) {
      return;
    }

    const message = generateWhatsAppMessage(
      items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal,
      vat,
      total,
    );

    const url = `https://wa.me/254700000000?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      type="button"
      variant={variant}
      className={`gap-2 ${fullWidth ? "w-full" : ""} ${className}`.trim()}
      onClick={handleCheckout}
      disabled={items.length === 0}
    >
      <FaCommentDots className="h-4 w-4" />
      Checkout via WhatsApp
    </Button>
  );
}
