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
  /** Present only for variant products (e.g. sizes). */
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

  // When this is a variant product, the selected size's price/stock take
  // over; until a size is picked there's nothing purchasable yet.
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
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Price Section */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-slate-900">
            KES {effectivePrice.toLocaleString("en-KE")}
          </span>
          {hasDiscount && (
            <>
              <span className="text-lg text-slate-400 line-through">
                KES {effectiveCompareAtPrice.toLocaleString("en-KE")}
              </span>
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-medium text-red-600">
                Save {Math.round(((effectiveCompareAtPrice - effectivePrice) / effectiveCompareAtPrice) * 100)}%
              </span>
            </>
          )}
        </div>
        <p className="text-sm text-slate-500">
          {needsSizeSelection ? (
            <span className="text-slate-500">Select a size to see stock</span>
          ) : isOutOfStock ? (
            <span className="text-red-500 font-medium">Out of Stock</span>
          ) : effectiveStock < 10 ? (
            <span className="text-amber-600 font-medium">
              Only {effectiveStock} left in stock
            </span>
          ) : (
            <span>In Stock</span>
          )}
        </p>
      </div>

      {/* Size / Variant Selector */}
      {hasVariants && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Size</span>
          <div className="flex flex-wrap gap-2">
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
                    "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-700 hover:border-slate-400",
                    variantOutOfStock && "cursor-not-allowed opacity-40 line-through",
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
        <div className="flex items-center gap-4">
          <label htmlFor="quantity" className="text-sm font-medium text-slate-700">
            Quantity
          </label>
          <div className="flex items-center rounded-lg border border-slate-200">
            <button
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="px-3 py-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-sm font-medium text-slate-900">
              {quantity}
            </span>
            <button
              onClick={incrementQuantity}
              disabled={quantity >= effectiveStock}
              className="px-3 py-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={onAddToCart}
          disabled={isOutOfStock || needsSizeSelection}
          className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          <ShoppingCart className="h-5 w-5" />
          {needsSizeSelection ? "Select a Size" : isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>

        <Button
          onClick={onWhatsApp}
          variant="outline"
          className="w-full gap-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
          size="lg"
        >
          <Send className="h-5 w-5" />
          Order on WhatsApp
        </Button>
      </div>

      {/* Trust Badges */}
      <div className="flex justify-center gap-6 pt-2 text-xs text-slate-500">
        <span>✓ Secure Checkout</span>
        <span>✓ Fast Delivery</span>
        <span>✓ 100% Authentic</span>
      </div>
    </div>
  );
}