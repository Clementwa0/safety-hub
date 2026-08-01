"use client";

import Link from "next/link";
import { FaLock } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

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
  const { itemCount } = useCart();
  const disabled = itemCount === 0;

  if (disabled) {
    return (
      <Button
        type="button"
        variant={variant}
        className={`gap-2 ${fullWidth ? "w-full" : ""} ${className}`.trim()}
        disabled
      >
        <FaLock className="h-4 w-4" />
        Proceed to Checkout
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      className={`gap-2 ${fullWidth ? "w-full" : ""} ${className}`.trim()}
      nativeButton={false}
      render={<Link href="/checkout" />}
    >
      <FaLock className="h-4 w-4" />
      Proceed to Checkout
    </Button>
  );
}
