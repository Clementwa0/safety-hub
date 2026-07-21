"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaMinus, FaPlus } from "react-icons/fa6";

import { formatKES } from "@/lib/cart";

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({
  id,
  name,
  price,
  quantity,
  image,
  category,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const subtotal = price * quantity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-4 rounded-2xl border border-border bg-card/70 p-3 shadow-sm"
    >
      <Link href={`/products/${id}`} className="shrink-0">
        <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-muted">
          <Image src={image} alt={name} fill className="object-contain p-2" sizes="80px" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col">
        <Link href={`/products/${id}`}>
          <h4 className="line-clamp-2 text-sm font-semibold text-foreground transition-colors hover:text-secondary">
            {name}
          </h4>
        </Link>
        {category ? <p className="mt-1 text-xs text-muted-foreground">{category}</p> : null}
        <p className="mt-1 text-sm font-semibold text-secondary">{formatKES(price)}</p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg border border-border bg-background">
            <button
              type="button"
              onClick={() => onUpdateQuantity(id, Math.max(1, quantity - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-l-lg transition hover:bg-muted"
              aria-label="Decrease quantity"
            >
              <FaMinus className="h-3.5 w-3.5" />
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => onUpdateQuantity(id, Number(event.target.value || 1))}
              className="h-8 w-10 border-x border-border bg-transparent text-center text-sm font-medium outline-none"
              aria-label={`Quantity for ${name}`}
            />
            <button
              type="button"
              onClick={() => onUpdateQuantity(id, quantity + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-r-lg transition hover:bg-muted"
              aria-label="Increase quantity"
            >
              <FaPlus className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(id)}
            className="text-sm text-muted-foreground transition hover:text-red-500"
            aria-label={`Remove ${name}`}
          >
            Remove
          </button>
        </div>
      </div>

      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold text-foreground">{formatKES(subtotal)}</p>
        <p className="mt-1 text-xs text-muted-foreground">{formatKES(price)} × {quantity}</p>
      </div>
    </motion.div>
  );
}