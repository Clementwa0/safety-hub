"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaMinus, FaPlus } from "react-icons/fa6";

import { SafeImage } from "@/components/shared/SafeImage";
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
  onUpdateQuantity: (
    productId: string,
    quantity: number,
  ) => void | Promise<void>;
  onRemove: (productId: string) => void | Promise<void>;
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
  const safeStock = Math.max(0, Number(stock) || 0);
  const safeQuantity = Math.max(1, Number(quantity) || 1);

  const hasStock = safeStock > 0;
  const atMaxStock = !unavailable && hasStock && safeQuantity >= safeStock;

  const subtotal = price * safeQuantity;

  const productHref = `/products/${productId}`;

  const decreaseQuantity = () => {
    if (disabled || unavailable || safeQuantity <= 1) return;

    void onUpdateQuantity(productId, Math.max(1, safeQuantity - 1));
  };

  const increaseQuantity = () => {
    if (disabled || unavailable || !hasStock || atMaxStock) return;

    void onUpdateQuantity(
      productId,
      Math.min(safeStock, safeQuantity + 1),
    );
  };

  const handleQuantityChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (disabled || unavailable || !hasStock) return;

    const value = Number(event.target.value);

    if (!Number.isFinite(value)) return;

    const nextQuantity = Math.min(
      safeStock,
      Math.max(1, Math.floor(value)),
    );

    if (nextQuantity !== safeQuantity) {
      void onUpdateQuantity(productId, nextQuantity);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-4 rounded-xl bg-white p-4 shadow-sm"
    >
      {/* Product image */}
      {unavailable ? (
        <div
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100"
          aria-hidden="true"
        >
          {image ? (
            <SafeImage
              src={image}
              alt=""
              fill
              preset="thumbnail"
              className="object-contain p-2 opacity-60"
              sizes="80px"
            />
          ) : null}
        </div>
      ) : (
        <Link
          href={productHref}
          className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`View ${name}`}
        >
          <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
            {image ? (
              <SafeImage
                src={image}
                alt={name}
                fill
                preset="thumbnail"
                className="object-contain p-2"
                sizes="80px"
              />
            ) : null}
          </div>
        </Link>
      )}

      {/* Product details */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {unavailable ? (
              <h4 className="line-clamp-2 text-sm font-semibold text-foreground">
                {name}
              </h4>
            ) : (
              <Link
                href={productHref}
                className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <h4 className="line-clamp-2 text-sm font-semibold text-foreground transition-colors hover:text-secondary">
                  {name}
                </h4>
              </Link>
            )}

            {category ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {category}
              </p>
            ) : null}
          </div>

          <span className="shrink-0 text-sm font-semibold text-foreground">
            {formatKES(subtotal)}
          </span>
        </div>

        {/* Price / availability */}
        {unavailable ? (
          <p
            className="mt-1 text-xs font-medium text-destructive"
            role="alert"
          >
            {unavailableReason ?? "This item is no longer available."}
          </p>
        ) : (
          <p className="mt-1 text-sm font-semibold text-secondary">
            {formatKES(price)}
          </p>
        )}

        {/* Quantity controls */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {!unavailable ? (
            <>
              <div
                className="flex items-center rounded-lg border border-border"
                aria-label={`Quantity controls for ${name}`}
              >
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={
                    disabled ||
                    !hasStock ||
                    safeQuantity <= 1
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-l-lg transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Decrease quantity of ${name}`}
                >
                  <FaMinus className="h-3 w-3" />
                </button>

                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={hasStock ? safeStock : undefined}
                  step={1}
                  value={safeQuantity}
                  disabled={disabled || !hasStock}
                  onChange={handleQuantityChange}
                  onBlur={() => {
                    if (!hasStock) return;

                    const normalizedQuantity = Math.min(
                      safeStock,
                      Math.max(1, safeQuantity),
                    );

                    if (normalizedQuantity !== quantity) {
                      void onUpdateQuantity(
                        productId,
                        normalizedQuantity,
                      );
                    }
                  }}
                  className="h-8 w-12 border-x border-border bg-transparent text-center text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                  aria-label={`Quantity for ${name}`}
                  aria-describedby={
                    atMaxStock ? `${productId}-stock-status` : undefined
                  }
                />

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={
                    disabled ||
                    !hasStock ||
                    atMaxStock
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-r-lg transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Increase quantity of ${name}`}
                >
                  <FaPlus className="h-3 w-3" />
                </button>
              </div>

              {atMaxStock ? (
                <span
                  id={`${productId}-stock-status`}
                  className="text-xs font-medium text-amber-600"
                >
                  Max stock
                </span>
              ) : null}

              {!hasStock ? (
                <span
                  className="text-xs font-medium text-destructive"
                  role="alert"
                >
                  Out of stock
                </span>
              ) : null}
            </>
          ) : null}

          {/* Remove */}
          <button
            type="button"
            onClick={() => void onRemove(productId)}
            disabled={disabled}
            className="ml-auto rounded-sm text-sm text-muted-foreground transition hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Remove ${name} from cart`}
          >
            Remove
          </button>
        </div>
      </div>
    </motion.div>
  );
}