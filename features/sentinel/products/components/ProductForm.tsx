"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { productService } from "@/services/shared/product.service";
import { productSchema, type ProductFormInput, type ProductFormValues } from "@/lib/validation/product";
import type { Product } from "@/types/product";
import AdditionalInfoSection from "./AdditionalInfoSection";
import BasicInfoSection from "./BasicInfoSection";
import DetailsSection from "./DetailsSection";
import ImagesSection from "./ImagesSection";
import InventorySection from "./InventorySection";
import OptionsSection from "./OptionsSection";
import PricingSection from "./PricingSection";


interface ProductFormProps {
  product?: Product;
}

const TABS = [
  { value: "basic", label: "Basic info" },
  { value: "pricing", label: "Pricing" },
  { value: "inventory", label: "Inventory" },
  { value: "images", label: "Images" },
  { value: "options", label: "Options" },
  { value: "details", label: "Details" },
  { value: "additional", label: "Additional" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

const TAB_FIELDS: Record<TabValue, (keyof ProductFormInput)[]> = {
  basic: ["name", "description", "category", "subcategory", "brand", "sku"],
  pricing: ["price", "compareAtPrice"],
  inventory: ["stock", "status"],
  images: ["image", "images"],
  options: ["featured", "isNewArrival"],
  details: ["features", "specs"],
  additional: ["weight", "dimensions", "warranty", "certifications"],
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
    image: typeof product?.image === "string" ? product.image : (product?.image?.src ?? ""),
    images: Array.isArray(product?.images)
      ? product.images.map((img) => (typeof img === "string" ? img : img.src))
      : [],
    featured: product?.featured ?? false,
    isNewArrival: product?.isNewArrival ?? false,
    features: product?.features ?? [],
    specs: product?.specs ?? [],
    weight: product?.weight ?? "",
    dimensions: product?.dimensions ?? "",
    warranty: product?.warranty ?? "",
    certifications: product?.certifications ?? [],
  };
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabValue>("basic");
  const [saving, setSaving] = useState(false);

  const defaultValues = useMemo(() => buildDefaultValues(product), [product]);

  const methods = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
    mode: "onBlur",
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const tabHasError = (tab: TabValue) =>
    TAB_FIELDS[tab].some((field) => Boolean(errors[field]));

  const onSubmit = async (values: ProductFormValues) => {
    setSaving(true);

    try {
      if (product) {
        await productService.update(product.id, values);
        toast.success("Product updated");
      } else {
        await productService.create(values);
        toast.success("Product created");
      }

      router.push("/sentinel/products");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the product");
    } finally {
      setSaving(false);
    }
  };

  const onInvalid = () => {
    const firstErrorTab = TABS.find((tab) => tabHasError(tab.value));
    if (firstErrorTab) setActiveTab(firstErrorTab.value);
    toast.error("Please fix the highlighted fields.");
  };

  const busy = saving || isSubmitting;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={(value) => {
          if (typeof value === "string") setActiveTab(value as TabValue);
        }}>
          <TabsList className="flex-wrap">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="relative">
                {tab.label}
                {tabHasError(tab.value) ? (
                  <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-destructive" />
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="basic" className="mt-4">
            <BasicInfoSection />
          </TabsContent>
          <TabsContent value="pricing" className="mt-4">
            <PricingSection />
          </TabsContent>
          <TabsContent value="inventory" className="mt-4">
            <InventorySection />
          </TabsContent>
          <TabsContent value="images" className="mt-4">
            <ImagesSection />
          </TabsContent>
          <TabsContent value="options" className="mt-4">
            <OptionsSection />
          </TabsContent>
          <TabsContent value="details" className="mt-4">
            <DetailsSection />
          </TabsContent>
          <TabsContent value="additional" className="mt-4">
            <AdditionalInfoSection />
          </TabsContent>
        </Tabs>

        <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t bg-background/95 p-4 backdrop-blur sm:mx-0 sm:flex-row sm:justify-end sm:rounded-lg sm:border">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => router.push("/sentinel/products")}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {product ? "Save changes" : "Create product"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
