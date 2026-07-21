import type { Metadata } from "next";
import { getCategoriesWithCount } from "@/data/products";
import { CategoryHero, CategoriesHeader, CategoryGrid, CategoriesCTA } from "@/components/category";

export const metadata: Metadata = {
  title: "Categories - HSE Hub Limited",
  description: "Browse our comprehensive range of PPE and safety equipment categories.",
};

export default function CategoriesPage() {

  return (
    <main className="min-h-screen bg-slate-50 pt-16 sm:pt-20 lg:pt-24">
      <CategoryHero
        breadcrumbItems={[
          { label: "Home", href: "/" },
          { label: "Categories" },
        ]}
        title="Browse by"
        highlight="Safety Category"
        description="Find the right safety equipment for construction, manufacturing, healthcare, logistics, engineering, mining, and every workplace."
      />

      <section className="container mx-auto px-4 py-12 sm:py-16 lg:px-8">
        <CategoriesHeader />
        <CategoryGrid />
        <CategoriesCTA />
      </section>
    </main>
  );
}