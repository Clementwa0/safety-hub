import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FaMinus, FaPlus, FaCartShopping, FaWhatsapp } from "react-icons/fa6";

interface ProductPricingProps {
  price: number;
  stock: number;
  quantity: number;
  onQuantityChange: (value: number) => void;
  onAddToCart: () => void;
  onWhatsApp: () => void;
}

export function ProductPricing({
  price,
  stock,
  quantity,
  onQuantityChange,
  onAddToCart,
  onWhatsApp,
}: ProductPricingProps) {

  return (
    <Card className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6 shadow-md space-y-6">
      {/* Price + Secure Checkout */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Price</p>
          <p className="text-xl font-bold text-slate-900">
            KES {price.toLocaleString("en-KE")}
          </p>
          <p className="text-xs text-slate-500 mt-1">VAT Inclusive</p>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
          Secure Checkout
        </div>
      </div>
      {/* Quantity + Add to Cart */}
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-slate-300 bg-white">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-l-full transition hover:bg-slate-100"
            disabled={stock === 0}
          >
            <FaMinus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={() => onQuantityChange(Math.min(stock, quantity + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-r-full transition hover:bg-slate-100"
            disabled={stock === 0}
          >
            <FaPlus className="h-4 w-4" />
          </button>
        </div>

        <Button
          className="flex-1 gap-2 bg-slate-700 text-white hover:bg-slate-800"
          disabled={stock === 0}
          onClick={onAddToCart}
        >
          <FaCartShopping className="h-4 w-4" />
          Add to Cart
        </Button>
      </div>

      {/* WhatsApp Enquiry */}
      <Button
        variant="outline"
        className="mt-3 w-full gap-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50"
        onClick={onWhatsApp}
      >
        <FaWhatsapp className="h-4 w-4" />
        Enquire on WhatsApp
      </Button>
    </Card>
  );
}
