import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  FaArrowRight, 
  FaCircleCheck, 
  FaShieldHalved, 
  FaBox,
  FaArrowLeft
} from "react-icons/fa6";
import type { Metadata } from "next";

import { CATEGORIES, getProductsByCategory, getCategoriesWithCount } from "@/data/products";
import ProductCard from "@/components/products/components/Product-Card";
import { Breadcrumb } from "@/components/shared/ui-bits";

type Params = Promise<{ slug: string }>;

function normalizeCategorySlug(slug: string): string {
  const decoded = decodeURIComponent(slug);
  
  // Try to match with known categories (case-insensitive)
  const matchedCategory = CATEGORIES.find(
    (c: string) => c.toLowerCase() === decoded.toLowerCase()
  );
  
  return matchedCategory || decoded;
}

// Helper function to create the slug for a category
function createCategorySlug(category: string): string {
  // Use the exact category name as the slug (will be URL-encoded automatically)
  return category;
}

// Generate static params for all categories
export async function generateStaticParams() {
  return CATEGORIES.map((category: string) => ({
    slug: category, // Use exact category name, Next.js will encode it
  }));
}

// Generate metadata for each category
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  
  if (!slug) {
    return {
      title: "Category Not Found",
    };
  }

  const categoryName = normalizeCategorySlug(slug);
  const category = CATEGORIES.find(
    (c: string) => c.toLowerCase() === categoryName.toLowerCase()
  );

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  const products = getProductsByCategory(category);

  return {
    title: `${category} - HSE Hub Limited`,
    description: `Shop certified ${category.toLowerCase()} PPE equipment. ${products.length}+ products from trusted brands.`,
  };
}

interface CategoryPageProps {
  params: Params;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  
  if (!slug) {
    notFound();
  }

  const categoryName = normalizeCategorySlug(slug);
  const category = CATEGORIES.find(
    (c: string) => c.toLowerCase() === categoryName.toLowerCase()
  );

  if (!category) {
    notFound();
  }

  const products = getProductsByCategory(category);
  const categoriesWithCount = getCategoriesWithCount();
  const categoryCount = categoriesWithCount.find((c: { name: string; count: number }) => c.name === category)?.count || 0;

  // Standards relevant to the category
  const getStandards = (cat: string): string[] => {
    const standardsMap: Record<string, string[]> = {
      "Head Protection": ["EN397", "ANSI Z89.1", "ISO 45001"],
      "Eye Protection": ["EN166", "ANSI Z87.1", "ISO 4007"],
      "Ear Protection": ["EN352", "ANSI S3.19", "ISO 4869"],
      "Body Protection": ["EN361", "ANSI Z359", "ISO 10333"],
      "Protective Clothing": ["EN ISO 20471", "ANSI 107", "ISO 13688"],
      "Hand Protection": ["EN388", "ANSI 105", "ISO 13997"],
      "Foot Protection": ["EN ISO 20345", "ANSI Z41", "ISO 20344"],
      "Respiratory Protection": ["EN149", "ANSI Z88.2", "ISO 16900"],
      "Safety Equipment": ["EN3", "ANSI/UL 299", "ISO 7165"],
    };
    return standardsMap[cat] || ["ISO 45001", "EN 397", "ANSI Z89.1"];
  };

  // Applications for the category
  const getApplications = (cat: string): string[] => {
    const appsMap: Record<string, string[]> = {
      "Head Protection": ["Construction and heavy engineering", "Manufacturing and processing", "Mining and extraction"],
      "Eye Protection": ["Welding and fabrication", "Laboratory work", "Woodworking and machining"],
      "Ear Protection": ["Factory floors", "Construction sites", "Mining operations"],
      "Body Protection": ["Height work", "Confined spaces", "Rescue operations"],
      "Protective Clothing": ["Industrial work", "Chemical handling", "Fire fighting"],
      "Hand Protection": ["Construction work", "Chemical handling", "Food processing"],
      "Foot Protection": ["Construction sites", "Warehouse work", "Manufacturing plants"],
      "Respiratory Protection": ["Dust environments", "Chemical plants", "Healthcare facilities"],
      "Safety Equipment": ["Industrial sites", "Office buildings", "Public facilities"],
    };
    return appsMap[cat] || ["Industrial applications", "Workplace safety", "Site operations"];
  };

  const standards = getStandards(category);
  const applications = getApplications(category);

  return (
    <main className="min-h-screen bg-slate-50 pt-16 sm:pt-20 lg:pt-24">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: category },
        ]}
      />
      

      {/* Products Section */}
      <section className="mx-auto px-4 py-12 sm:py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-secondary">
              {products.length} Products
            </span>
            <h2 className="mt-1 text-2xl font-bold text-primary md:text-3xl">
              Shop {category}
            </h2>
          </div>

          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-secondary/80 transition"
          >
            View All Categories
            <FaArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white/50 p-12 text-center">
            <FaBox className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-semibold text-primary">No products found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Check back soon for new products in this category.
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary/90"
            >
              Browse All Products
              <FaArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} featured={product.featured} />
            ))}
          </div>
        )}
      </section>

      {/* Info Section */}
      <section className="border-y border-border bg-white py-12 sm:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Buying Guide */}
            <div>
              <h3 className="text-lg font-bold text-primary">Buying Guide</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <li className="flex gap-2.5">
                  <FaCircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                  Match certification to your regulatory requirement.
                </li>
                <li className="flex gap-2.5">
                  <FaCircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                  Consider fit, comfort, and duration of use.
                </li>
                <li className="flex gap-2.5">
                  <FaCircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                  Bulk orders of 10+ units qualify for corporate pricing.
                </li>
              </ul>
            </div>

            {/* Applications */}
            <div>
              <h3 className="text-lg font-bold text-primary">Applications</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                {applications.map((app, index) => (
                  <li key={index} className="flex gap-2.5">
                    <FaShieldHalved className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                    {app}
                  </li>
                ))}
              </ul>
            </div>

            {/* Safety Standards */}
            <div>
              <h3 className="text-lg font-bold text-primary">Safety Standards</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {standards.map((standard) => (
                  <span
                    key={standard}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700"
                  >
                    {standard}
                  </span>
                ))}
              </div>
              <Link
                href="/contact"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary/90"
              >
                Get a Quotation
                <FaArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Categories */}
      <section className="container mx-auto px-4 py-12 sm:py-16 lg:px-8">
        <h3 className="text-xl font-bold text-primary">Related Categories</h3>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {CATEGORIES.filter((c: string) => c !== category).slice(0, 5).map((cat: string) => {
            const count = categoriesWithCount.find((c: { name: string; count: number }) => c.name === cat)?.count || 0;
            const slug = createCategorySlug(cat);
            return (
              <Link
                key={cat}
                href={`/categories/${encodeURIComponent(slug)}`}
                className="group rounded-lg border bg-white p-4 text-center shadow-sm transition hover:shadow-md hover:border-secondary/30"
              >
                <h4 className="text-sm font-semibold text-primary group-hover:text-secondary transition">
                  {cat}
                </h4>
                <p className="text-xs text-muted-foreground">{count} products</p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}