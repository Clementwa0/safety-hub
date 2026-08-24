"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { useProduct } from "@/hooks/useProduct";
import { useCart } from "@/hooks/useCart";
import { useCartUIStore } from "@/store/cart-ui-store";
import { useSettings } from "@/components/SettingsProvider";
import type { Product } from "@/types/product";
import { ProductGallery, ProductHeader, ProductNotFound, ProductPricing, ProductRelated, ProductSkeleton, ProductTabs } from "..";

function ProductPurchasePanel({
  product,
  selectedVariantSku,
  onSelectVariant,
  onAddToCart,
  onWhatsApp,
}: {
  product: Product;
  selectedVariantSku: string | undefined;
  onSelectVariant: (sku: string) => void;
  onAddToCart: (quantity: number, variantSku?: string) => void;
  onWhatsApp: () => void;
}) {
  const [qty, setQty] = useState(1);

  return (
    <ProductPricing
      price={product.price}
      compareAtPrice={product.compareAtPrice}
      stock={product.stock}
      quantity={qty}
      onQuantityChange={setQty}
      onAddToCart={() => onAddToCart(qty, selectedVariantSku)}
      onWhatsApp={onWhatsApp}
      variants={product.variants}
      selectedVariantSku={selectedVariantSku}
      onSelectVariant={onSelectVariant}
    />
  );
}

export default function ProductPage() {
  const params = useParams();
  const { settings } = useSettings();
  const slug = params.slug as string;
  const { product, relatedProducts, loading, error } = useProduct(slug);
  const { addItem } = useCart();
  const openCart = useCartUIStore((state) => state.openCart);
  const [selectedVariantSku, setSelectedVariantSku] = useState<string | undefined>(undefined);

  // Reset the picked size whenever the customer lands on a different
  // product, so a stale size from the last product page never carries over.
  useEffect(() => {
    setSelectedVariantSku(undefined);
  }, [product?.id]);

  const selectedVariant = product?.variants?.find((variant) => variant.sku === selectedVariantSku);

  const handleAddToCart = async (quantity: number, variantSku?: string) => {
    if (!product) return;
    try {
      await addItem(product.id, variantSku, quantity);
      openCart();
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add to cart");
    }
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const url = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
      `Hello ${settings.companyName}, I'm interested in ${product.name} (${product.category}) for KES ${product.price.toLocaleString(
        "en-KE"
      )}.`
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return <ProductSkeleton />;
  }

  if (error || !product) {
    return <ProductNotFound productId={slug} />;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ProductGallery product={product} selectedVariantImage={selectedVariant?.image} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col gap-6"
        >
          <ProductHeader product={product} />
          <ProductPurchasePanel
            key={product.id}
            product={product}
            selectedVariantSku={selectedVariantSku}
            onSelectVariant={setSelectedVariantSku}
            onAddToCart={handleAddToCart}
            onWhatsApp={handleWhatsApp}
          />
        </motion.div>
      </div>

      <div className="mt-12">
        <ProductTabs product={product} />
      </div>

      {relatedProducts && relatedProducts.length > 0 && (
        <ProductRelated products={relatedProducts} />
      )}
    </main>
  );
}