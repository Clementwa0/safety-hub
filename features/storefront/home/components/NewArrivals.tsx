import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

import { hasVariants, type Product } from "@/types/product";
import ProductCard from "../../catalog/products/components/ProductCard";

interface NewArrivalsProps {
  /** Already-fetched, server-side - see the same note in FeaturedProducts.tsx. */
  products: Product[];
}

export default function NewArrivals({ products }: NewArrivalsProps) {
  const items = products.slice(0, 4);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-8 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-primary sm:text-2xl">
              New Arrivals
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              The latest safety gear just added to the shop.
            </p>
          </div>

          <Link
            href="/new-arrivals"
            className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-secondary"
          >
            See All
            <FaArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div
          className="gap-4 grid grid-cols-2 sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0
                     lg:grid-cols-4 lg:gap-5"
        >
          {items.map((product) => (
            <div
              key={product.id}
              className="w-[45vw] shrink-0 snap-start sm:w-auto"
            >
              <ProductCard product={{ ...product, hasVariants: hasVariants(product) }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
