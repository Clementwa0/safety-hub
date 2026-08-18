"use client";

import { Minus, Plus, ShoppingCart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductPricingProps {
  price: number;
  compareAtPrice?: number;
  stock: number;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onWhatsApp: () => void;
}

export function ProductPricing({
  price,
  compareAtPrice,
  stock,
  quantity,
  onQuantityChange,
  onAddToCart,
  onWhatsApp,
}: ProductPricingProps) {
  const isOutOfStock = stock === 0;
  const hasDiscount = compareAtPrice && compareAtPrice > price;

  const incrementQuantity = () => {
    if (quantity < stock) {
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
            KES {price.toLocaleString("en-KE")}
          </span>
          {hasDiscount && (
            <>
              <span className="text-lg text-slate-400 line-through">
                KES {compareAtPrice.toLocaleString("en-KE")}
              </span>
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-medium text-red-600">
                Save {Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}%
              </span>
            </>
          )}
        </div>
        <p className="text-sm text-slate-500">
          {isOutOfStock ? (
            <span className="text-red-500 font-medium">Out of Stock</span>
          ) : stock < 10 ? (
            <span className="text-amber-600 font-medium">
              Only {stock} left in stock
            </span>
          ) : (
            <span>In Stock</span>
          )}
        </p>
      </div>

      {/* Quantity Selector */}
      {!isOutOfStock && (
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
              disabled={quantity >= stock}
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
          disabled={isOutOfStock}
          className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          <ShoppingCart className="h-5 w-5" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
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