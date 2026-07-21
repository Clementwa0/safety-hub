"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Package, FileText, Truck } from "lucide-react";
import type { Product } from "@/data/products";

interface ProductTabsProps {
  product: Product;
}

const tabs = [
  {
    id: "description",
    label: "Description",
    icon: FileText,
  },
  {
    id: "specifications",
    label: "Specifications",
    icon: Package,
  },
  {
    id: "features",
    label: "Features",
    icon: CheckCircle2,
  },
];

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <Card className="rounded-3xl border bg-white shadow-sm">
      {/* Tabs */}
      <div className="flex overflow-x-auto border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "border-secondary text-secondary"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "description" && (
          <div className="prose prose-sm max-w-none text-slate-700">
            <p>{product.description}</p>
          </div>
        )}

        {activeTab === "specifications" && (
          <>
            {product.specs?.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {product.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="rounded-xl border bg-slate-50 p-4"
                  >
                    <p className="text-xs uppercase text-slate-500">
                      {spec.label}
                    </p>

                    <p className="mt-1 font-semibold">{spec.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">No specifications available.</p>
            )}
          </>
        )}

        {activeTab === "features" && (
          <>
            {product.features?.length ? (
              <ul className="space-y-3">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-green-600" />

                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500">No features available.</p>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
