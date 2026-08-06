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
      className="flex gap-4 rounded-xl bg-white p-4 shadow-sm"
    >
      <Link href={unavailable ? "#" : `/products/${productId}`} className="shrink-0">
        <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
          {image ? (
            <SafeImage src={image} alt={name} fill className="object-contain p-2" sizes="80px" />
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <Link href={unavailable ? "#" : `/products/${productId}`}>
            <h4 className="line-clamp-2 text-sm font-semibold text-foreground transition-colors hover:text-secondary">
              {name}
            </h4>
          </Link>
          <span className="text-sm font-semibold text-foreground">{formatKES(subtotal)}</span>
        </div>

        {category ? <p className="text-xs text-muted-foreground">{category}</p> : null}

        {unavailable ? (
          <p className="text-xs font-medium text-destructive">
            {unavailableReason ?? "This item is no longer available."}
          </p>
        ) : (
          <p className="text-sm font-semibold text-secondary">{formatKES(price)}</p>
        )}

        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-border">
            <button
              type="button"
              onClick={() => onUpdateQuantity(productId, Math.max(1, quantity - 1))}
              disabled={disabled || unavailable || quantity <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-l-lg transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <FaMinus className="h-3 w-3" />
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
              <FaPlus className="h-3 w-3" />
            </button>
          </div>

          {atMaxStock && <span className="text-xs text-amber-600">Max stock</span>}

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
    </motion.div>
  );
}