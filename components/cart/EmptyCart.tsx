"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaBagShopping } from "react-icons/fa6";

import { Button } from "@/components/ui/button";

interface EmptyCartProps {
  onContinue?: () => void;
}

export default function EmptyCart({ onContinue }: EmptyCartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 text-center sm:py-24"
    >
      <div className="mb-6 rounded-full bg-secondary/10 p-6">
        <FaBagShopping className="h-12 w-12 text-secondary" />
      </div>
      <h2 className="text-2xl font-bold text-primary">Your cart is empty</h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Looks like you haven&apos;t added any items to your cart yet. Browse our collection
        and find the perfect safety equipment for your needs.
      </p>
      <Button asChild className="mt-6" onClick={onContinue}>
        <Link href="/shop">Continue Shopping</Link>
      </Button>
    </motion.div>
  );
}