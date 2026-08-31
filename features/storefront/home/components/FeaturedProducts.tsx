import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

import ProductCard, { type ProductCardItem } from "@/features/storefront/catalog/products/components/ProductCard";
import { hasVariants, type Product } from "@/types/product";

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const items: ProductCardItem[] = products.slice(0, 4).map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    image: product.image,
    stock: product.stock,
    reserved: product.reserved,
    featured: true,
    isNewArrival: false,
    compareAtPrice: product.compareAtPrice,
    brand: product.brand,
    rating: product.rating,
    reviews: product.reviews,
    hasVariants: hasVariants(product),
  }));

  return (
    <section className="bg-slate-50 py-8 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-primary sm:text-2xl">
              Featured Products
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Popular safety products selected for you.
            </p>
          </div>

          <Link
            href="/featured"
            className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-secondary"
          >
            See All
            <FaArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {items.length > 0 ? (
          <div
            className="grid gap-4 grid-cols-2 md:grid-cols-3
                       lg:grid-cols-4 lg:gap-5"
          >
            {items.map((product) => (
              <div
                key={product.id}
                className="w-[45vw] shrink-0 snap-start sm:w-auto"
              >
                <ProductCard
                  product={product}
                  featured={true}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No featured products available right now.
            </p>

            <Link
              href="/shop"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary"
            >
              Browse Shop
              <FaArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
