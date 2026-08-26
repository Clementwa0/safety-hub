"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { productService } from "@/services/shared/product.service";
import {
  productSchema,
  type ProductFormInput,
  type ProductFormValues,
} from "@/lib/validation/product";

import type { Product } from "@/types/product";

import AdditionalInfoSection from "./AdditionalInfoSection";
import BasicInfoSection from "./BasicInfoSection";
import DetailsSection from "./DetailsSection";
import ImagesSection from "./ImagesSection";
import InventorySection from "./InventorySection";
import OptionsSection from "./OptionsSection";
import PricingSection from "./PricingSection";
import VariantsSection from "./VariantsSection";

interface ProductFormProps {
  product?: Product;
}

const TABS = [
  { value: "basic", label: "Basic" },
  { value: "pricing", label: "Pricing" },
  { value: "inventory", label: "Inventory" },
  { value: "variants", label: "Variants" },
  { value: "images", label: "Images" },
  { value: "options", label: "Options" },
  { value: "details", label: "Details" },
  { value: "additional", label: "Additional" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

const TAB_FIELDS: Record<TabValue, (keyof ProductFormInput)[]> = {
  basic: [
    "name",
    "description",
    "category",
    "subcategory",
    "brand",
    "sku",
  ],
  pricing: ["price", "compareAtPrice"],
  inventory: ["stock", "status"],
  variants: ["variants"],
  images: ["image", "images"],
  options: ["featured", "isNewArrival"],
  details: ["features", "specs"],
  additional: [
    "weight",
    "dimensions",
    "warranty",
    "certifications",
  ],
};

function buildDefaultValues(product?: Product): ProductFormInput {
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",

    category: product ? String(product.category) : "",
    subcategory: product?.subcategory ?? "",

    brand: product?.brand ?? "",
    sku: product?.sku ?? "",

    price: product?.price ?? 0,
    compareAtPrice: product?.compareAtPrice,

    stock: product?.stock ?? 0,
    status: product?.status ?? "active",

    image:
      typeof product?.image === "string"
        ? product.image
        : (product?.image?.src ?? ""),

    images: Array.isArray(product?.images)
      ? product.images.map((img) =>
          typeof img === "string" ? img : img.src,
        )
      : [],

    featured: product?.featured ?? false,
    isNewArrival: product?.isNewArrival ?? false,

    features: product?.features ?? [],
    specs: product?.specs ?? [],
    variants: product?.variants ?? [],

    weight: product?.weight ?? "",
    dimensions: product?.dimensions ?? "",
    warranty: product?.warranty ?? "",
    certifications: product?.certifications ?? [],
  };
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] =
    useState<TabValue>("basic");

  const [saving, setSaving] = useState(false);

  const defaultValues = useMemo(
    () => buildDefaultValues(product),
    [product],
  );

  const methods = useForm<
    ProductFormInput,
    unknown,
    ProductFormValues
  >({
    resolver: zodResolver(productSchema),
    defaultValues,
    mode: "onBlur",
  });

  const {
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = methods;

  const tabHasError = (tab: TabValue) => {
    return TAB_FIELDS[tab].some(
      (field) => Boolean(errors[field]),
    );
  };

  const onSubmit = async (
    values: ProductFormValues,
  ) => {
    setSaving(true);

    try {
      if (product) {
        await productService.update(
          product.id,
          values,
        );

        toast.success("Product updated successfully");
      } else {
        await productService.create(values);

        toast.success("Product created successfully");
      }

      router.push("/sentinel/products");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save the product",
      );
    } finally {
      setSaving(false);
    }
  };

  const onInvalid = () => {
    const firstErrorTab = TABS.find((tab) =>
      tabHasError(tab.value),
    );

    if (firstErrorTab) {
      setActiveTab(firstErrorTab.value);
    }

    toast.error(
      "Please fix the highlighted fields.",
    );
  };

  const busy = saving || isSubmitting;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(
          onSubmit,
          onInvalid,
        )}
        className="space-y-4 sm:space-y-6"
      >
        {/* ------------------------------------------------
            Tabs
        ------------------------------------------------ */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (
              typeof value === "string" &&
              TABS.some(
                (tab) => tab.value === value,
              )
            ) {
              setActiveTab(value as TabValue);
            }
          }}
          className="w-full"
        >
          {/* Mobile horizontal scrolling tabs */}
          <div className="w-full overflow-x-auto scrollbar-none">
            <TabsList
              className="
                inline-flex
                h-9

                min-w-max
                gap-0.5
                rounded-sm
                border
                border-md
                border-gray-600
                p-1
                sm:h-10
                sm:w-full
                sm:justify-start
              "
            >
              {TABS.map((tab) => {
                const hasError =
                  tabHasError(tab.value);

                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="
                      relative
                      h-7
                      shrink-0
                      whitespace-nowrap
                      px-2.5
                      border
                      text-[12px]
                      sm:h-8
                      sm:px-3
                      sm:text-sm
                    "
                  >
                    {tab.label}

                    {hasError && (
                      <span
                        className="
                          ml-1.5
                          h-1.5
                          w-1.5
                          shrink-0
                          rounded-full
                          bg-destructive
                        "
                        aria-label="Contains errors"
                      />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* ------------------------------------------------
              Basic
          ------------------------------------------------ */}
          <TabsContent
            value="basic"
            className="mt-4 focus-visible:outline-none sm:mt-5"
          >
            <BasicInfoSection />
          </TabsContent>

          {/* ------------------------------------------------
              Pricing
          ------------------------------------------------ */}
          <TabsContent
            value="pricing"
            className="mt-4 focus-visible:outline-none sm:mt-5"
          >
            <PricingSection />
          </TabsContent>

          {/* ------------------------------------------------
              Inventory
          ------------------------------------------------ */}
          <TabsContent
            value="inventory"
            className="mt-4 focus-visible:outline-none sm:mt-5"
          >
            <InventorySection />
          </TabsContent>

          {/* ------------------------------------------------
              Variants
          ------------------------------------------------ */}
          <TabsContent
            value="variants"
            className="mt-4 focus-visible:outline-none sm:mt-5"
          >
            <VariantsSection />
          </TabsContent>

          {/* ------------------------------------------------
              Images
          ------------------------------------------------ */}
          <TabsContent
            value="images"
            className="mt-4 focus-visible:outline-none sm:mt-5"
          >
            <ImagesSection />
          </TabsContent>

          {/* ------------------------------------------------
              Options
          ------------------------------------------------ */}
          <TabsContent
            value="options"
            className="mt-4 focus-visible:outline-none sm:mt-5"
          >
            <OptionsSection />
          </TabsContent>

          {/* ------------------------------------------------
              Details
          ------------------------------------------------ */}
          <TabsContent
            value="details"
            className="mt-4 focus-visible:outline-none sm:mt-5"
          >
            <DetailsSection />
          </TabsContent>

          {/* ------------------------------------------------
              Additional
          ------------------------------------------------ */}
          <TabsContent
            value="additional"
            className="mt-4 focus-visible:outline-none sm:mt-5"
          >
            <AdditionalInfoSection />
          </TabsContent>
        </Tabs>

        {/* ------------------------------------------------
            Save bar
        ------------------------------------------------ */}
        <div
          className="
            sticky
            bottom-0
            z-30
            -mx-4
            border-t
            bg-background/95
            px-4
            py-3
            backdrop-blur
            supports-[backdrop-filter]:bg-background/80

            sm:static
            sm:mx-0
            sm:border
            sm:rounded-lg
            sm:px-4
          "
        >
          <div
            className="
              flex
              flex-col-reverse
              gap-2
              sm:flex-row
              sm:justify-end
            "
          >
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() =>
                router.push(
                  "/sentinel/products",
                )
              }
              className="h-9 w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={busy}
              className="h-9 w-full sm:w-auto"
            >
              {busy && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              {product
                ? "Save changes"
                : "Create product"}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}