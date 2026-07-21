"use client";

import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

import { SectionHeader } from "../shared/ui-bits";
import { CategoryGrid } from "../category";

export default function Categories() {
  return (
    <section id="categories" className="bg-slate-50 py-20">
      <div className="container mx-auto px-6 lg:px-8 space-y-12">
        
        {/* Heading */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            title="Shop by Category"
            subtitle="Certified PPE and workplace safety equipment tailored for every industry."
          />
          <Link
            href="/categories"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:gap-2 hover:text-primary/80"
          >
            See All
            <FaArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {/* Categories Grid */}
        <CategoryGrid limit={4} />

        {/* Bottom CTAs */}
        <div className="mt-14 flex flex-wrap justify-center gap-4">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Browse Complete Catalogue
            <FaArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/bulk-orders"
            className="inline-flex items-center gap-2 rounded-xl border border-primary px-8 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            Request Bulk Quote
            <FaArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
