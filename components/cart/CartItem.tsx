"use client";

import Link from "next/link";
import { SafeImage } from "@/components/shared/SafeImage";
import { motion } from "framer-motion";
import { FaMinus, FaPlus } from "react-icons/fa6";

import { formatKES } from "@/lib/format";

interface CartItemProps {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
  stock: number;
  unavailable?: boolean;
  unavailableReason?: string;
  disabled?: boolean;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export default function CartItem({
  productId,
  name,
  price,
  quantity,
  image,
  category,
  stock,
  unavailable = false,
  unavailableReason,
  disabled = false,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const subtotal = price * quantity;
  const atMaxStock = !unavailable && quantity >= stock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-4 rounded-2xl border border-border bg-card/70 p-3 shadow-sm"
    >
      <Link href={unavailable ? "#" : `/products/${productId}`} className="shrink-0">
        <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-muted">
          {image ? (
            <SafeImage src={image} alt={name} fill className="object-contain p-2" sizes="80px" />
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col">
        <Link href={unavailable ? "#" : `/products/${productId}`}>
          <h4 className="line-clamp-2 text-sm font-semibold text-foreground transition-colors hover:text-secondary">
            {name}
          </h4>
        </Link>
        {category ? <p className="mt-1 text-xs text-muted-foreground">{category}</p> : null}

        {unavailable ? (
          <p className="mt-1 text-xs font-medium text-destructive">
            {unavailableReason ?? "This item is no longer available."}
          </p>
        ) : (
          <p className="mt-1 text-sm font-semibold text-secondary">{formatKES(price)}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg border border-border bg-background">
            <button
              type="button"
              onClick={() => onUpdateQuantity(productId, Math.max(1, quantity - 1))}
              disabled={disabled || unavailable || quantity <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-l-lg transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <FaMinus className="h-3.5 w-3.5" />
            </button>
            <input
              type="number"
              min="1"
              max={unavailable ? undefined : stock}
              value={quantity}
              disabled={disabled || unavailable}
              onChange={(event) => onUpdateQuantity(productId, Math.max(1, Number(event.target.value || 1)))}
              className="h-8 w-10 border-x border-border bg-transparent text-center text-sm font-medium outline-none disabled:opacity-40"
              aria-label={`Quantity for ${name}`}
            />
            <button
              type="button"
              onClick={() => onUpdateQuantity(productId, quantity + 1)}
              disabled={disabled || unavailable || atMaxStock}
              className="flex h-8 w-8 items-center justify-center rounded-r-lg transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <FaPlus className="h-3.5 w-3.5" />
            </button>
          </div>

          {atMaxStock && <span className="text-xs text-orange-600">Max stock reached</span>}

          <button
            type="button"
            onClick={() => onRemove(productId)}
            disabled={disabled}
            className="text-sm text-muted-foreground transition hover:text-red-500 disabled:opacity-40"
            aria-label={`Remove ${name}`}
          >
            Remove
          </button>
        </div>
      </div>

      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold text-foreground">{formatKES(subtotal)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatKES(price)} × {quantity}
        </p>
      </div>
    </motion.div>
  );
}
