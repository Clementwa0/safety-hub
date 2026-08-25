import type { Metadata } from "next";
import { Suspense } from "react";
import { FaHome, FaShoppingBag } from "react-icons/fa";

import { Breadcrumb, SectionWrapper } from "@/components/shared/ui-bits";
import { Loading } from "@/components/shared/Loading";
import ShopContent from "./components/ShopContent";

export const metadata: Metadata = {
  title: "Shop PPE & Safety Equipment - HSE Hub Limited",
  description:
    "Browse certified PPE, workplace safety equipment, industrial safety products and protective gear from HSE Hub Limited.",
};

export default function ShopPage() {
  return (
    <main>
      <SectionWrapper>
        {" "}
        <Breadcrumb
          items={[
            {
              label: "Home",
              href: "/",
              icon: <FaHome className="h-3.5 w-3.5" />,
            },
            {
              label: "Shop",
              icon: <FaShoppingBag className="h-3.5 w-3.5" />,
            },
          ]}
        />
      </SectionWrapper>

      <SectionWrapper>
        <Suspense
          fallback={<Loading label="Loading products..." className="py-24" />}
        >
          <ShopContent />
        </Suspense>
      </SectionWrapper>
    </main>
  );
}
