import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Truck, Star } from "lucide-react";
import type { Product } from "@/types/product";

interface ProductHeaderProps {
  product: Product;
}

export function ProductHeader({ product }: ProductHeaderProps) {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Category & Badges */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <Badge className="bg-secondary text-white text-[10px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1">
          {product.category}
        </Badge>
        {product.featured && (
          <Badge variant="outline" className="text-[10px] sm:text-xs border-amber-400 text-amber-600">
            <Star className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
            Featured
          </Badge>
        )}
        {product.isNewArrival && (
          <Badge className="bg-emerald-500 text-white text-[10px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1">
            New
          </Badge>
        )}
        <Badge variant="outline" className="text-[10px] sm:text-xs">
          SKU: {product.id.slice(0, 8)}
        </Badge>
      </div>

      {/* Name */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-slate-900">
        {product.name}
      </h1>

      {/* Description */}
      <p className="max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed">
        {product.description}
      </p>

      {/* Trust Badges */}
      <div className="flex flex-wrap gap-3 sm:gap-4 border-t pt-4 text-xs sm:text-sm text-slate-600">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-secondary" />
          <span>Fast Delivery</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-secondary" />
          <span>Certified PPE</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="font-medium">5.0</span>
        </div>
      </div>
    </div>
  );
}