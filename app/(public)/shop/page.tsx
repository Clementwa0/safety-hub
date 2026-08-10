import type { Metadata } from "next";
import { FaHome, FaShoppingBag } from "react-icons/fa";

import {
  Breadcrumb,
  SectionWrapper,
} from "@/components/shared/ui-bits";
import ShopContent from "@/components/shop/ShopContent";

export const metadata: Metadata = {
  title: "Shop PPE & Safety Equipment - HSE Hub Limited",
  description:
    "Browse certified PPE, workplace safety equipment, industrial safety products and protective gear from HSE Hub Limited.",
};

export default function ShopPage() {
  return (
    <main className="mx-auto w-full max-w-7xl pb-28 pt-8 lg:pb-16">
      {/* Breadcrumb */}
      <SectionWrapper >
        <div className="py-4">
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
        </div>
      </SectionWrapper>

      {/* Shop */}
      <SectionWrapper>
        <ShopContent />
      </SectionWrapper>
    </main>
  );
}