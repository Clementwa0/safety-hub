import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Truck } from "lucide-react";
import type { Product } from "@/types/product";

interface ProductHeaderProps {
  product: Product;
}

export function ProductHeader({ product }: ProductHeaderProps) {

  return (
    <div className="space-y-5">

      {/* Category */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="bg-secondary text-white">
          {product.category}
        </Badge>

        <Badge variant="outline">
          SKU: {product.id}
        </Badge>
      </div>

      {/* Name */}
      <h1 className="text-3xl font-bold leading-tight text-slate-900">
        {product.name}
      </h1>
      {/* Description */}
      <p className="max-w-2xl text-slate-600">
        {product.description}
      </p>
      {/* Trust */}
      <div className="flex flex-wrap gap-4 border-t pt-4 text-sm text-slate-600">

        <div className="flex items-center gap-2">
          <Truck size={16} />
          Fast Delivery
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck size={16} />
          Certified PPE
        </div>

      </div>
    </div>
  );
}