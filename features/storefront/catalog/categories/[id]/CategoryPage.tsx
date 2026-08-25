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
} from "@/modules/catalog/catalog";


import {
  Breadcrumb,
  SectionWrapper,
} from "@/components/shared/ui-bits";

import {
  getCategoryDescription,
  getCategoryStandards,
  getCategoryApplications,
} from "@/lib/constants/index";
import CategoryProductsSection from "../components/CategoryProductsSection";

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

interface CategoryPageProps {
  params: Params;
}

export async function generateStaticParams() {
  try {
    const categories = await getCategoriesWithCounts();

    return categories.map((category) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.warn(
      "generateStaticParams: could not reach the database, falling back to on-demand rendering.",
      error
    );

    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;

  if (!slug) {
    return {
      title: "Category Not Found",
    };
  }

  const category = await getCategoryBySlug(
    slug.toLowerCase()
  );

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  const products = await getProductsByCategoryId(
    category.id,
    "active"
  );

  return {
    title: `${category.name} - HSE Hub Limited`,
    description: `Shop certified ${category.name.toLowerCase()} PPE equipment. ${products.length}+ products from trusted brands.`,
  };
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const matched = await getCategoryBySlug(
    slug.toLowerCase()
  );

  if (!matched) {
    notFound();
  }

  const category = matched.name;

  const [products, categoriesWithCount] = await Promise.all([
    getProductsByCategoryId(matched.id, "active"),
    getCategoriesWithCounts(),
  ]);

  const description = getCategoryDescription(category);
  const standards = getCategoryStandards(category);
  const applications = getCategoryApplications(category);

  const relatedCategories = categoriesWithCount
    .filter((item) => item.name !== category)
    .slice(0, 5);

  return (
    <main>
      <SectionWrapper compact>
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Categories", href: "/categories" },
            { label: category },
          ]}
        />
      </SectionWrapper>
      <SectionWrapper   className="rounded-lg border border-gray-100 bg-slate-50/60 py-8 sm:px-6">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center sm:p-14">
              <span className="rounded-full bg-slate-100 p-4">
                <FaBox
                  className="h-10 w-10 text-muted-foreground/60"
                  aria-hidden="true"
                />
              </span>

              <p className="mt-5 text-lg font-semibold text-primary">
                No products found
              </p>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                We don't have any{" "}
                {category.toLowerCase()} listed right now.
                Check back soon, or browse the rest of our
                catalog.
              </p>

              <Link
                href="/shop"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary/90"
              >
                Browse All Products
                <FaArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>
            </div>
          ) : (
            <CategoryProductsSection
              products={products}
              category={category}
            />
          )}
      </SectionWrapper>

      <SectionWrapper className="border-y border-border">
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          <div className="rounded-2xl border border-gray-100 bg-slate-50/60 p-6">
            <h3 className="text-lg font-bold text-primary">
              Buying Guide
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2.5">
                <FaCircleCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
                  aria-hidden="true"
                />
                Match certification to your regulatory
                requirement.
              </li>

              <li className="flex gap-2.5">
                <FaCircleCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
                  aria-hidden="true"
                />
                Consider fit, comfort, and duration of use.
              </li>

              <li className="flex gap-2.5">
                <FaCircleCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
                  aria-hidden="true"
                />
                Bulk orders of 10+ units qualify for
                corporate pricing.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-slate-50/60 p-6">
            <h3 className="text-lg font-bold text-primary">
              Applications
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {applications.map((application) => (
                <li
                  key={application}
                  className="flex gap-2.5"
                >
                  <FaShieldHalved
                    className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
                    aria-hidden="true"
                  />
                  {application}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-slate-50/60 p-6">
            <h3 className="text-lg font-bold text-primary">
              Safety Standards
            </h3>

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
              <FaArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </SectionWrapper>

      {relatedCategories.length > 0 && (
        <SectionWrapper>
          <div className="flex items-end justify-between">
            <h3 className="text-xl font-bold text-primary">
              Related Categories
            </h3>

            <Link
              href="/categories"
              className="hidden text-sm font-medium text-secondary transition hover:text-secondary/80 sm:inline-flex sm:items-center sm:gap-1.5"
            >
              View all
              <FaArrowRight
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {relatedCategories.map((item) => (
              <Link
                key={item.id}
                href={`/categories/${item.slug}`}
                className="group rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-secondary/30 hover:shadow-md"
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
        </SectionWrapper>
      )}
    </main>
  );
}