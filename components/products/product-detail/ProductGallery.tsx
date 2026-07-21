import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/data/products";

interface ProductGalleryProps {
  product: Product;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const primaryImage = product.images?.[0] ?? product.image;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Product Image */}
      <div className="relative aspect-square">
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          priority
          className="object-contain transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Status Badges */}
      <div className="absolute left-4 top-4 flex flex-col gap-2">
        {product.featured && (
          <Badge className="bg-secondary text-white">
            Featured
          </Badge>
        )}

        {product.stock > 0 && product.stock < 10 && (
          <Badge variant="destructive">
            Low Stock
          </Badge>
        )}

        {product.stock === 0 && (
          <Badge variant="destructive">
            Out of Stock
          </Badge>
        )}
      </div>
    </div>
  );
}