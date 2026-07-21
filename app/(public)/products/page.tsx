import { Metadata } from "next";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

import { CATEGORIES, getCategoriesWithCount } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Products - HSE Hub Limited",
  description: "Browse our extensive collection of certified PPE and safety equipment.",
};

export default function ProductsPage() {
  const categoriesWithCount = getCategoriesWithCount();

  return (
    <main
     className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14" >
      {/* Header */}
      <section className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
            Our Products
          </h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-muted-foreground">
            Explore our comprehensive range of certified PPE and industrial safety equipment.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categoriesWithCount.map(({ name, count }: { name: string; count: number }) => (
            <Link
              key={name}
              href={`/shop?category=${encodeURIComponent(name)}`}
              className="group block"
            >
              <Card className="h-full transition-all duration-300 hover:shadow-md hover:border-secondary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm sm:text-base font-semibold text-primary group-hover:text-secondary transition-colors line-clamp-2">
                    {name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {count} product{count !== 1 ? "s" : ""}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="text-xs gap-1 group-hover:gap-2 transition-all">
                    Browse
                    <FaArrowRight className="h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Products Link */}
        <div className="mt-8 text-center">
          <Link href="/shop">
            <Button variant="outline" size="lg" className="gap-2">
              View All Products
              <FaArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}