"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";
import { useEffect, useState } from "react";

import { categoryService } from "@/services/shared/category.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Products - HSE Hub Limited",
  description: "Browse our extensive collection of certified PPE and safety equipment.",
};

export default function ProductsPage() {
  const [categoriesWithCount, setCategoriesWithCount] = useState<Array<{ name: string; productCount: number }>>([]);

  useEffect(() => {
    void categoryService.list().then((items) => setCategoriesWithCount(items.map(({ name, productCount }) => ({ name, productCount }))));
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-10 lg:py-14">
      {/* Header */}
      <section className="border-b bg-white/80 backdrop-blur-sm rounded-xl mb-6 sm:mb-8">
        <div className="px-4 py-6 sm:px-6 sm:py-10 lg:py-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
            Our Products
          </h1>
          <p className="mt-1.5 sm:mt-2 max-w-2xl text-sm sm:text-base text-muted-foreground">
            Explore our comprehensive range of certified PPE and industrial safety equipment.
          </p>
        </div>
      </section>

      {/* Category Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
        {categoriesWithCount.map(({ name, productCount }) => (
          <Link key={name} href={`/shop?category=${encodeURIComponent(name)}`} className="group block">
            <Card className="h-full transition-all duration-300 hover:border-secondary/30 hover:shadow-lg hover:shadow-secondary/5">
              <CardHeader className="pb-1.5 sm:pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
                <CardTitle className="line-clamp-2 text-xs sm:text-sm font-semibold text-primary transition-colors group-hover:text-secondary">
                  {name}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-1.5 sm:pb-2">
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {productCount} product{productCount !== 1 ? "s" : ""}
                </p>
              </CardContent>
              <CardFooter className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1 text-[10px] sm:text-xs transition-all group-hover:gap-2 px-2 sm:px-3"
                >
                  Browse
                  <FaArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-6 sm:mt-8 text-center">
        <Link href="/shop">
          <Button variant="outline" size="lg" className="gap-2 text-sm sm:text-base">
            View All Products
            <FaArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </Link>
      </div>
    </main>
  );
}