"use client";

import { useState } from "react";
import type { StaticImageData } from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { AiOutlineEye } from "react-icons/ai";
import {
  FaCartPlus,
  FaCircleCheck,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { CiDiscount1 } from "react-icons/ci";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/shared/SafeImage";
import { cn } from "@/lib/utils";
import { formatKES } from "@/lib/format";
import { useCart } from "@/hooks/useCart";
import { getDiscountPercent } from "@/types/product";

export interface ProductCardItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string | StaticImageData;
  stock: number;
  featured?: boolean;
  description?: string;
  subcategory?: string;
  isNewArrival?: boolean;
  compareAtPrice?: number;
  brand?: string;
  hasVariants?: boolean;
}

export interface ProductCardProps {
  product: ProductCardItem;
  featured?: boolean;
  priority?: boolean;
  compact?: boolean;
  showActionText?: boolean;
  className?: string;
}

export default function ProductCard({
  product,
  featured,
  priority = false,
  compact = false,
  showActionText = false,
  className,
}: ProductCardProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [adding, setAdding] = useState(false);

  const {
    id,
    name,
    category,
    price,
    image,
    stock,
    brand,
    compareAtPrice,
    hasVariants,
    isNewArrival,
  } = product;

  const isVariant = Boolean(hasVariants);
  const isInStock = stock > 0;
  const isOutOfStock = !isVariant && !isInStock;
  const isLowStock = !isVariant && isInStock && stock < 10;
  const isFeatured = featured ?? product.featured ?? false;

  const isDiscounted =
    typeof compareAtPrice === "number" && compareAtPrice > price;

  const discount = isDiscounted
    ? getDiscountPercent(price, compareAtPrice)
    : null;

  const productHref = `/products/${id}`;

  const contentSpacing = compact ? "p-1.5" : "p-3";
  const gap = compact ? "gap-0.5" : "gap-1";

  const nameSize = compact
    ? "text-[11px] leading-tight"
    : "text-sm leading-snug sm:text-base";

  const badgeSize = compact
    ? "px-1 py-0.5 text-[6px]"
    : "px-2 py-0.5 text-[8px]";

  const priceSize = compact ? "text-sm" : "text-base sm:text-lg";

  const comparePriceSize = compact ? "text-[9px]" : "text-xs sm:text-sm";

  const labelSize = compact ? "text-[7px]" : "text-[8px]";

  const handleAction = async () => {
    if (isVariant) {
      router.push(productHref);
      return;
    }

    if (isOutOfStock) {
      toast.error("This product is currently out of stock");
      return;
    }

    if (adding) return;

    setAdding(true);

    try {
      await addItem(id, undefined, 1);

      toast.success(`${name} added to cart`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not add this product to cart",
      );
    } finally {
      setAdding(false);
    }
  };

  const actionDisabled = adding || isOutOfStock;

  return (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg",
        "border bg-card shadow-sm",
        "transition-all duration-200 ease-out",
        "hover:shadow-md",
        className,
      )}
    >
      <Link
        href={productHref}
        aria-label={`View ${name}`}
        className="block flex-1"
      >
        {/* Product image */}
        <div className="relative aspect-square overflow-hidden bg-muted/40">
          <SafeImage
            src={image}
            alt={name}
            fill
            preset="card"
            priority={priority}
            loading={priority ? undefined : "lazy"}
            quality={85}
            sizes="(max-width:480px) 45vw, (max-width:640px) 40vw, (max-width:768px) 30vw, (max-width:1024px) 22vw, 18vw"
            className={cn(
              "object-cover transition-transform duration-500",
              !reduceMotion && "group-hover:scale-[1.04]",
            )}
          />

          {/* Badges */}
          <div className="pointer-events-none absolute inset-x-1 top-1 flex items-start justify-between gap-0.5">
            <div className="flex max-w-[60%] flex-wrap gap-0.5">
              {isFeatured && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "rounded font-semibold uppercase leading-none tracking-wide",
                    badgeSize,
                  )}
                >
                  Featured
                </Badge>
              )}

              {isNewArrival && (
                <Badge
                  className={cn(
                    "rounded border-0 bg-blue-500 font-semibold uppercase leading-none tracking-wide text-white hover:bg-blue-500",
                    badgeSize,
                  )}
                >
                  New
                </Badge>
              )}
            </div>

            <div className="flex max-w-[40%] flex-wrap justify-end gap-0.5">
              {isOutOfStock && (
                <Badge
                  variant="destructive"
                  className={cn(
                    "rounded font-semibold uppercase leading-none tracking-wide",
                    badgeSize,
                  )}
                >
                  Out
                </Badge>
              )}

              {isDiscounted && discount !== null && (
                <Badge
                  variant="destructive"
                  className={cn(
                    "flex items-center gap-1 rounded-md font-bold uppercase leading-none tracking-wide",
                    compact
                      ? "px-1.5 py-1 text-[8px]"
                      : "px-2.5 py-1.5 text-[10px]",
                  )}
                >
                  <CiDiscount1
                    className={cn(
                      "shrink-0",
                      compact ? "h-3 w-3" : "h-3.5 w-3.5",
                    )}
                  />
                  -{discount}%
                </Badge>
              )}
            </div>
          </div>

          {/* Quick view */}
          <div className="pointer-events-none absolute inset-x-2 bottom-2 hidden sm:block">
            <span
              className={cn(
                "flex items-center justify-center gap-1",
                "rounded-md bg-black/60 px-2 py-1",
                "text-[8px] font-medium text-white",
                "opacity-0 backdrop-blur-sm",
                "transition-opacity duration-200",
                "group-hover:opacity-100",
              )}
            >
              <AiOutlineEye className="text-[10px]" aria-hidden="true" />
              Quick View
            </span>
          </div>
        </div>

        {/* Product information */}
        <div className={cn("flex flex-col", contentSpacing, gap)}>
          <div className="flex min-w-0 items-center justify-between gap-1">
            {brand ? (
              <p
                className={cn(
                  "min-w-0 truncate font-semibold uppercase tracking-wider text-muted-foreground/60",
                  labelSize,
                )}
              >
                {brand}
              </p>
            ) : (
              <span />
            )}

            <p
              className={cn(
                "shrink-0 truncate font-medium text-muted-foreground/50",
                labelSize,
              )}
            >
              {category}
            </p>
          </div>

          <h3
            className={cn(
              "line-clamp-2 font-semibold text-foreground",
              "transition-colors duration-200",
              "group-hover:text-secondary",
              nameSize,
            )}
          >
            {name}
          </h3>

          <StockStatus
            isVariant={isVariant}
            isInStock={isInStock}
            isLowStock={isLowStock}
            stock={stock}
            compact={compact}
          />
        </div>
      </Link>

      {/* Footer */}
      <div
        className={cn(
          "mt-auto flex items-center justify-between gap-1.5",
          "border-t",
          contentSpacing,
        )}
      >
        <Price
          price={price}
          compareAtPrice={compareAtPrice}
          priceSize={priceSize}
          comparePriceSize={comparePriceSize}
        />

        <Button
          type="button"
          size={compact ? "icon" : "sm"}
          variant="default"
          disabled={actionDisabled}
          onClick={() => void handleAction()}
          aria-label={
            isVariant
              ? `Select options for ${name}`
              : isOutOfStock
                ? `${name} is out of stock`
                : `Add ${name} to cart`
          }
          className={cn(
            "shrink-0 rounded-full",
            "bg-sky-700 text-secondary-foreground",
            "hover:bg-secondary/90",
            compact ? "h-7 w-7" : "px-2",
            "active:scale-95",
          )}
        >
          {adding ? (
            <span
              className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />
          ) : (
            <FaCartPlus
              className={compact ? "text-[9px]" : "text-xs"}
              aria-hidden="true"
            />
          )}

          {showActionText && (
            <span className="hidden whitespace-nowrap sm:inline">
              {adding
                ? "Adding..."
                : isVariant
                  ? "Select Size"
                  : isOutOfStock
                    ? "Out"
                    : "Add"}
            </span>
          )}
        </Button>
      </div>
    </motion.article>
  );
}

/* -------------------------------------------------------------------------- */
/* Stock status                                                               */
/* -------------------------------------------------------------------------- */

function StockStatus({
  isVariant,
  isInStock,
  isLowStock,
  stock,
  compact,
}: {
  isVariant: boolean;
  isInStock: boolean;
  isLowStock: boolean;
  stock: number;
  compact: boolean;
}) {
  const textSize = compact ? "text-[7px]" : "text-[10px]";
  const iconSize = compact ? "text-[7px]" : "text-[9px]";

  if (isVariant) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "w-fit rounded border-blue-200 bg-blue-50",
          "font-semibold text-blue-700",
          "dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300",
          textSize,
        )}
      >
        <svg
          className="h-2.5 w-2.5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0"
          />
        </svg>
        Multiple sizes
      </Badge>
    );
  }

  if (!isInStock) {
    return (
      <span className={cn("font-medium text-destructive", textSize)}>
        Out of Stock
      </span>
    );
  }

  if (isLowStock) {
    return (
      <span
        className={cn(
          "flex items-center gap-0.5 font-medium text-orange-600",
          textSize,
        )}
      >
        <FaTriangleExclamation
          className={cn("shrink-0", iconSize)}
          aria-hidden="true"
        />

        {compact ? `${stock} left` : `Only ${stock} left`}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex items-center gap-0.5 font-medium text-green-600",
        textSize,
      )}
    >
      <FaCircleCheck className={cn("shrink-0", iconSize)} aria-hidden="true" />
      In Stock
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Price                                                                      */
/* -------------------------------------------------------------------------- */

function Price({
  price,
  compareAtPrice,
  priceSize,
  comparePriceSize,
}: {
  price: number;
  compareAtPrice?: number;
  priceSize: string;
  comparePriceSize: string;
}) {
  const isDiscounted =
    typeof compareAtPrice === "number" && compareAtPrice > price;

  return (
    <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
      <span
        className={cn(
          "whitespace-nowrap font-bold leading-none tracking-tight text-secondary",
          priceSize,
        )}
      >
        {formatKES(price)}
      </span>

      {isDiscounted && (
        <span
          className={cn(
            "whitespace-nowrap font-medium leading-none",
            "text-muted-foreground/50 line-through",
            comparePriceSize,
          )}
        >
          {formatKES(compareAtPrice)}
        </span>
      )}
    </div>
  );
}
