import { notFound } from "next/navigation";
import Link from "next/link";
import {
  FaArrowRight,
  FaCircleCheck,
  FaShieldHalved,
  FaBox,
  FaHatCowboy,
} from "react-icons/fa6";
import type { Metadata } from "next";

import {
  getCategoriesWithCounts,
  getCategoryBySlug,
  getProductsByCategoryId,
} from "@/lib/server/catalog";
import CategoryProductsSection from "@/components/category/CategoryProductsSection";
import { Breadcrumb } from "@/components/shared/ui-bits";

// This page depends on live MongoDB data (product counts, newly added
// categories/products), so it revalidates on a timer rather than trying to
// statically render at build time with no database access.
export const revalidate = 3600;

// Next.js 16 always passes `params` as a Promise for dynamic segments.
type Params = Promise<{ slug: string }>;

interface CategoryPageProps {
  params: Params;
}

// Generate static params (lowercase slugs) for all categories currently in
// the DB, so known categories are pre-rendered at build time. Categories
// added later in admin still work via on-demand ISR (see `revalidate`
// above / dynamicParams default).
export async function generateStaticParams() {
  try {
    const categories = await getCategoriesWithCounts();
    return categories.map((category) => ({
      slug: category.slug,
    }));
  } catch (error) {
    // If the DB isn't reachable at build time (e.g. a CI build without
    // MONGODB_URI configured), don't fail the whole `next build` — fall
    // back to rendering every category on-demand at request time instead.
    // `dynamicParams` defaults to true and `revalidate` above turns this
    // into standard ISR, so pages are still cached after their first hit.
    console.warn(
      "generateStaticParams: could not reach the database, falling back to on-demand rendering.",
      error,
    );
    return [];
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;

  if (!slug) {
    return {
      title: "Category Not Found",
    };
  }

  const category = await getCategoryBySlug(slug.toLowerCase());

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  const products = await getProductsByCategoryId(category.id, "active");

  return {
    title: `${category.name} - HSE Hub Limited`,
    description: `Shop certified ${category.name.toLowerCase()} PPE equipment. ${products.length}+ products from trusted brands.`,
  };
}

// Short descriptive copy for the category hero. Keyed by known category
// names; anything not in this map (e.g. a category added later in admin)
// still renders, just with the generic fallback line.
const getDescription = (cat: string): string => {
  const descriptionMap: Record<string, string> = {
    "Head Protection":
      "Certified helmets and hard hats engineered to protect against impact, penetration, and falling objects on site.",
    "Eye Protection":
      "Safety glasses and goggles built to shield against debris, dust, splashes, and radiation hazards.",
    "Ear Protection":
      "Earmuffs and plugs rated to reduce noise exposure in high-decibel industrial environments.",
    "Body Protection":
      "Harnesses and fall-arrest systems designed for height work, rescue, and confined-space safety.",
    "Protective Clothing":
      "Hi-vis and chemical-resistant workwear that keeps crews visible, dry, and protected on shift.",
    "Hand Protection":
      "Cut-, chemical-, and abrasion-resistant gloves for tasks that put hands on the front line.",
    "Foot Protection":
      "Safety boots and shoes built for impact resistance, grip, and all-day comfort on site.",
    "Respiratory Protection":
      "Masks and respirators rated to filter dust, fumes, and airborne contaminants.",
    "Safety Equipment":
      "General-purpose safety gear and site equipment for everyday workplace protection.",
  };
  return (
    descriptionMap[cat] ||
    "Certified PPE built to keep your team protected, compliant, and comfortable on the job."
  );
};

// Standards relevant to the category. Keyed by known category names;
// anything not in this map (e.g. a category added later in admin) still
// renders, just with the generic fallback set.
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

// Applications for the category — same fallback approach as above.
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  // /categories/[slug] -> CategoryModel.findOne({ slug }) -> Category._id
  const matched = await getCategoryBySlug(slug.toLowerCase());

  if (!matched) {
    notFound();
  }

  const category = matched.name;
  // Category._id -> ProductModel.find({ category: Category._id, status: "active" })
  const [products, categoriesWithCount] = await Promise.all([
    getProductsByCategoryId(matched.id, "active"),
    getCategoriesWithCounts(),
  ]);
  const standards = getStandards(category);
  const applications = getApplications(category);
  const description = getDescription(category);

  return (
    <main className="min-h-screen bg-slate-50 pt-16 sm:pt-20 lg:pt-24">
      <Breadcrumb
        className="container mx-auto mb-4 rounded-xl bg-primary px-4 py-2.5 lg:px-8"
        items={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: category },
        ]}
      />

      <section className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="hidden shrink-0 rounded-2xl bg-secondary/10 p-3 text-secondary sm:inline-flex">
                <FaHatCowboy className="h-7 w-7" aria-hidden="true" />
              </span>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                  PPE Category
                </span>
                <h1 className="mt-1 text-2xl font-bold text-primary sm:text-3xl lg:text-4xl">
                  {category}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {description}
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

      <section className="mx-auto px-4 py-12 sm:py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary transition hover:text-secondary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
          >
            View All Categories
            <FaArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mb-8 rounded-lg border border-gray-100 bg-slate-50/60 px-4 py-10 sm:px-6">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center sm:p-16">
            <span className="rounded-full bg-slate-100 p-4">
              <FaBox className="h-10 w-10 text-muted-foreground/60" aria-hidden="true" />
            </span>
            <p className="mt-5 text-lg font-semibold text-primary">No products found</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              We don't have any {category.toLowerCase()} listed right now. Check back soon,
              or browse the rest of our catalog.
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
          <CategoryProductsSection products={products} category={category} />
        )}
        </div>
      </section>

      <section className="border-y border-border bg-white py-12 sm:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3 md:gap-10">
            <div className="rounded-2xl border border-gray-100 bg-slate-50/60 p-6">
              <h3 className="text-lg font-bold text-primary">Buying Guide</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2.5">
                  <FaCircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
                  Match certification to your regulatory requirement.
                </li>
                <li className="flex gap-2.5">
                  <FaCircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
                  Consider fit, comfort, and duration of use.
                </li>
                <li className="flex gap-2.5">
                  <FaCircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
                  Bulk orders of 10+ units qualify for corporate pricing.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-slate-50/60 p-6">
              <h3 className="text-lg font-bold text-primary">Applications</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {applications.map((app, index) => (
                  <li key={index} className="flex gap-2.5">
                    <FaShieldHalved className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
                    {app}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-slate-50/60 p-6">
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
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
              >
                Get a Quotation
                <FaArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {categoriesWithCount.filter((item) => item.name !== category).length > 0 && (
        <section className="container mx-auto px-4 py-12 sm:py-16 lg:px-8">
          <div className="flex items-end justify-between">
            <h3 className="text-xl font-bold text-primary">Related Categories</h3>
            <Link
              href="/categories"
              className="hidden text-sm font-medium text-secondary transition hover:text-secondary/80 sm:inline-flex sm:items-center sm:gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            >
              View all
              <FaArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categoriesWithCount
              .filter((item) => item.name !== category)
              .slice(0, 5)
              .map((item) => (
                <Link
                  key={item.id}
                  href={`/categories/${item.slug}`}
                  className="group rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-secondary/30 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                >
                  <h4 className="text-sm font-semibold text-primary transition group-hover:text-secondary">
                    {item.name}
                  </h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.productCount ?? 0} products
                  </p>
                </Link>
              ))}
          </div>
        </section>
      )}
    </main>
  );
}
