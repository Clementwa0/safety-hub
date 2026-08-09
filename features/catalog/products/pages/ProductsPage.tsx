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
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <section className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <h1 className="text-2xl font-bold text-primary sm:text-3xl md:text-4xl">Our Products</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Explore our comprehensive range of certified PPE and industrial safety equipment.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {categoriesWithCount.map(({ name, productCount }) => (
            <Link key={name} href={`/shop?category=${encodeURIComponent(name)}`} className="group block">
              <Card className="h-full transition-all duration-300 hover:border-secondary/30 hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-2 text-sm font-semibold text-primary transition-colors group-hover:text-secondary sm:text-base">
                    {name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {productCount} product{productCount !== 1 ? "s" : ""}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs transition-all group-hover:gap-2">
                    Browse
                    <FaArrowRight className="h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>

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
