import Link from "next/link";
import { FaArrowRight, FaBox, FaStar } from "react-icons/fa6";
import type { Metadata } from "next";

import { getProductsByFlag } from "@/lib/server/catalog";
import CategoryProductsSection from "@/components/category/CategoryProductsSection";
import { Breadcrumb } from "@/components/shared/ui-bits";

// Which products are flagged `featured` can change from admin at any time,
// so re-check the DB periodically rather than only at build time.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Featured Products - HSE Hub Limited",
  description:
    "Our top-recommended certified PPE and safety equipment, hand-picked by the HSE Hub team.",
};

export default async function FeaturedPage() {
  const products = await getProductsByFlag("featured", "active");

  return (
    <main className="min-h-screen bg-slate-50 pt-16 sm:pt-20 lg:pt-24">
      <Breadcrumb
        className="container mx-auto mb-4 rounded-xl bg-primary px-4 py-2.5 lg:px-8"
        items={[{ label: "Home", href: "/" }, { label: "Featured" }]}
      />

      {/* Hero */}
      <section className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="hidden shrink-0 rounded-2xl bg-secondary/10 p-3 text-secondary sm:inline-flex">
                <FaStar className="h-7 w-7" aria-hidden="true" />
              </span>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                  Hand-Picked
                </span>
                <h1 className="mt-1 text-2xl font-bold text-primary sm:text-3xl lg:text-4xl">
                  Featured Products
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Our top-recommended safety gear — proven, certified, and
                  trusted by teams on site every day.
                </p>
              </div>
            </div>

            <Link
              href="/contact"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            >
              Get a Quotation
              <FaArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto px-4 py-12 sm:py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary transition hover:text-secondary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
          >
            View All Products
            <FaArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mb-8 rounded-lg border border-gray-100 bg-slate-50/60 px-4 py-10 sm:px-6">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center sm:p-16">
              <span className="rounded-full bg-slate-100 p-4">
                <FaBox className="h-10 w-10 text-muted-foreground/60" aria-hidden="true" />
              </span>
              <p className="mt-5 text-lg font-semibold text-primary">No featured products right now</p>
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
      </section>
    </main>
  );
}
