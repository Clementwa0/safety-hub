import Link from "next/link";
import { FaArrowRight, FaBox, FaStar } from "react-icons/fa6";
import type { Metadata } from "next";

import { getProductsByFlag } from "@/lib/server/catalog";
import { Breadcrumb, SectionWrapper } from "@/components/shared/ui-bits";
import { FaHome } from "react-icons/fa";
import CategoryProductsSection from "../categories/components/CategoryProductsSection";

export const metadata: Metadata = {
  title: "Featured Products - HSE Hub Limited",
  description:
    "Our top-recommended certified PPE and safety equipment, hand-picked by the HSE Hub team.",
};

export default async function FeaturedPage() {
  const products = await getProductsByFlag("featured", "active");

  return (
    <main>
      <SectionWrapper compact>
          <Breadcrumb
            items={[
              {
                label: "Home",
                href: "/",
                icon: <FaHome className="h-3.5 w-3.5" />,
              },
              {
                label: "Featured Products",
                icon: <FaStar className="h-3.5 w-3.5" />,
              },
            ]}
          />
      </SectionWrapper>

      <SectionWrapper>
        <div className=" rounded-lg border border-gray-100 bg-slate-50/60 px-4 py-5 sm:px-6">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center sm:p-16">
              <span
                className="rounded-full bg-slate-100 p-4"
                aria-hidden="true"
              >
                <FaBox
                  className="h-10 w-10 text-muted-foreground/60"
                  aria-hidden="true"
                />
              </span>

              <h2 className="mt-5 text-lg font-semibold text-primary">
                No featured products right now
              </h2>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Check back soon, or browse the rest of our catalog.
              </p>

              <Link
                href="/shop"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
              >
                Browse All Products
                <FaArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <CategoryProductsSection products={products} category="featured" />
          )}
        </div>
      </SectionWrapper>
    </main>
  );
}
