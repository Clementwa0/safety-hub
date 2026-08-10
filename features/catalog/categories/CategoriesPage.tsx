import type { Metadata } from "next";
import {
  CategoriesHeader,
  CategoryGrid,
  CategoriesCTA,
} from "@/components/category";
import {
  Breadcrumb,
  SectionWrapper,
} from "@/components/shared/ui-bits";
import { FaTags } from "react-icons/fa6";
import { FaHome } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Categories - HSE Hub Limited",
  description:
    "Browse our comprehensive range of PPE and safety equipment categories.",
};

export default function CategoriesPage() {
  return (
    <main>
      {/* Breadcrumb */}
      <SectionWrapper
      >
        <div className="py-4">
          <Breadcrumb
            items={[
              {
                label: "Home",
                href: "/",
                icon: <FaHome className="h-3.5 w-3.5" />,
              },
              {
                label: "Categories",
                icon: <FaTags className="h-3.5 w-3.5" />,
              },
            ]}
          />
        </div>
      </SectionWrapper>

      {/* Categories */}
      <SectionWrapper >
        <CategoriesHeader />
        <CategoryGrid />
        <CategoriesCTA />
      </SectionWrapper>
    </main>
  );
}
