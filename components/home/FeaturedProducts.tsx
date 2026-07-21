"use client";

import { PRODUCTS } from "@/data/products";
import ProductCard from "../products/components/Product-Card";

export default function FeaturedProducts() {
  return (
    <>
      {/* Featured Products */}
      <section className="bg-[#F8FAFC] py-4">
        <div className="container px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
                Featured Products
              </h2>

              <p className="mt-3 max-w-2xl text-muted-foreground">
                Explore our most popular personal protective equipment and
                industrial safety solutions trusted by professionals across
                Kenya.
              </p>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {PRODUCTS.filter((product) => product.featured)
              .slice(0, 4)
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
