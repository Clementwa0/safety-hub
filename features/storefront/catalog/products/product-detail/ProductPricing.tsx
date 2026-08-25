"use client";

import { Minus, Plus, ShoppingCart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductVariant } from "@/types/product";
import { cn } from "@/lib/utils";

interface ProductPricingProps {
  price: number;
  compareAtPrice?: number;
  stock: number;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onWhatsApp: () => void;
  variants?: ProductVariant[];
  selectedVariantSku?: string;
  onSelectVariant?: (sku: string) => void;
}

export function ProductPricing({
  price,
  compareAtPrice,
  stock,
  quantity,
  onQuantityChange,
  onAddToCart,
  onWhatsApp,
  variants,
  selectedVariantSku,
  onSelectVariant,
}: ProductPricingProps) {
  const hasVariants = Boolean(variants && variants.length > 0);
  const selectedVariant = hasVariants
    ? variants?.find((variant) => variant.sku === selectedVariantSku)
    : undefined;

  const effectivePrice = selectedVariant ? selectedVariant.price : price;
  const effectiveCompareAtPrice = selectedVariant ? selectedVariant.compareAtPrice : compareAtPrice;
  const effectiveStock = hasVariants ? (selectedVariant ? selectedVariant.stock : 0) : stock;

  const needsSizeSelection = hasVariants && !selectedVariant;
  const isOutOfStock = !needsSizeSelection && effectiveStock === 0;
  const hasDiscount = effectiveCompareAtPrice && effectiveCompareAtPrice > effectivePrice;

  const incrementQuantity = () => {
    if (quantity < effectiveStock) {
      onQuantityChange(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
      {/* Price Section */}
      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900">
            KES {effectivePrice.toLocaleString("en-KE")}
          </span>
          {hasDiscount && (
            <>
              <span className="text-sm sm:text-lg text-slate-400 line-through">
                KES {effectiveCompareAtPrice.toLocaleString("en-KE")}
              </span>
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] sm:text-sm font-medium text-red-600">
                -{Math.round(((effectiveCompareAtPrice - effectivePrice) / effectiveCompareAtPrice) * 100)}%
              </span>
            </>
          )}
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          {needsSizeSelection ? (
            <span className="text-amber-600 font-medium">Select a size to see stock</span>
          ) : isOutOfStock ? (
            <span className="text-red-500 font-medium">Out of Stock</span>
          ) : effectiveStock < 10 ? (
            <span className="text-amber-600 font-medium">
              Only {effectiveStock} left in stock
            </span>
          ) : (
            <span className="text-green-600">✓ In Stock</span>
          )}
        </p>
      </div>

      {/* Size / Variant Selector */}
      {hasVariants && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Select Size</span>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {variants!.map((variant) => {
              const isSelected = variant.sku === selectedVariantSku;
              const variantOutOfStock = variant.stock - variant.reserved <= 0;
              return (
                <button
                  key={variant.sku}
                  type="button"
                  onClick={() => onSelectVariant?.(variant.sku)}
                  disabled={variantOutOfStock}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-colors",
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50",
                    variantOutOfStock && "cursor-not-allowed opacity-40 line-through"
                  )}
                >
                  {variant.size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      {!isOutOfStock && !needsSizeSelection && (
        <div className="flex items-center gap-3 sm:gap-4">
          <label htmlFor="quantity" className="text-xs sm:text-sm font-medium text-slate-700">
            Quantity
          </label>
          <div className="flex items-center rounded-lg border border-slate-200">
            <button
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <span className="w-10 sm:w-12 text-center text-xs sm:text-sm font-medium text-slate-900">
              {quantity}
            </span>
            <button
              onClick={incrementQuantity}
              disabled={quantity >= effectiveStock}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2.5 sm:space-y-3">
        <Button
          onClick={onAddToCart}
          disabled={isOutOfStock || needsSizeSelection}
          className="w-full gap-2 bg-secondary hover:bg-secondary/90 text-white text-sm sm:text-base py-2.5 sm:py-3"
          size="lg"
        >
          <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
          {needsSizeSelection ? "Select a Size" : isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>

        <Button
          onClick={onWhatsApp}
          variant="outline"
          className="w-full gap-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 text-sm sm:text-base py-2.5 sm:py-3"
          size="lg"
        >
          <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          Order on WhatsApp
        </Button>
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-1 sm:pt-2 text-[10px] sm:text-xs text-slate-500">
        <span>✓ Secure Checkout</span>
        <span>✓ Fast Delivery</span>
        <span>✓ 100% Authentic</span>
      </div>
    </div>
  );
}