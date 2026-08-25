"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Package, FileText } from "lucide-react";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";

interface ProductTabsProps {
  product: Product;
}

const tabs = [
  { id: "description", label: "Description", icon: FileText },
  { id: "specifications", label: "Specs", icon: Package },
  { id: "features", label: "Features", icon: CheckCircle2 },
];

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <Card className="rounded-2xl sm:rounded-3xl border bg-white shadow-sm overflow-hidden">
      {/* Tabs - Scrollable on mobile */}
      <div className="flex overflow-x-auto border-b bg-slate-50/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 sm:gap-2 border-b-2 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-all",
                isActive
                  ? "border-secondary text-secondary bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-white/50"
              )}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {activeTab === "description" && (
          <div className="prose prose-sm max-w-none text-slate-700">
            <p className="leading-relaxed">{product.description}</p>
          </div>
        )}

        {activeTab === "specifications" && (
          <>
            {product.specs?.length ? (
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                {product.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="rounded-xl border bg-slate-50/80 p-3 sm:p-4"
                  >
                    <p className="text-[10px] sm:text-xs uppercase text-slate-500 font-medium">
                      {spec.label}
                    </p>
                    <p className="mt-0.5 sm:mt-1 font-semibold text-sm sm:text-base">
                      {spec.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No specifications available.</p>
            )}
          </>
        )}

        {activeTab === "features" && (
          <>
            {product.features?.length ? (
              <ul className="space-y-2.5 sm:space-y-3">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 sm:gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 shrink-0" />
                    <span className="text-sm sm:text-base text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No features available.</p>
            )}
          </>
        )}
      </div>
    </Card>
  );
}