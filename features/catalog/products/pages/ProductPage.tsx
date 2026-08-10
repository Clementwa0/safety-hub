"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { useProduct } from "@/hooks/useProduct";
import { useCart } from "@/hooks/useCart";
import { useCartUIStore } from "@/store/cart-ui-store";
import { COMPANY } from "@/lib/constants";

import type { Product } from "@/types/product";

import {
  ProductGallery,
  ProductHeader,
  ProductPricing,
  ProductRelated,
  ProductSkeleton,
  ProductTabs,
  ProductNotFound,
} from "@/components/products";

import {
  Breadcrumb,
  SectionWrapper,
} from "@/components/shared/ui-bits";

function ProductPurchasePanel({
  product,
  onAddToCart,
  onWhatsApp,
}: {
  product: Product;
  onAddToCart: (quantity: number) => void;
  onWhatsApp: () => void;
}) {
  const [quantity, setQuantity] = useState(1);

  return (
    <ProductPricing
      price={product.price}
      compareAtPrice={product.compareAtPrice}
      stock={product.stock}
      quantity={quantity}
      onQuantityChange={setQuantity}
      onAddToCart={() => onAddToCart(quantity)}
      onWhatsApp={onWhatsApp}
    />
  );
}

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;

  const {
    product,
    relatedProducts,
    loading,
    error,
  } = useProduct(slug);

  const { addItem } = useCart();

  const openCart = useCartUIStore(
    (state) => state.openCart
  );

  const handleAddToCart = async (quantity: number) => {
    if (!product) return;

    try {
      await addItem(product.id, quantity);

      openCart();

      toast.success(
        `${product.name} added to cart`
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not add to cart"
      );
    }
  };

  const handleWhatsApp = () => {
    if (!product) return;

    const message = `Hello ${COMPANY.name}, I'm interested in ${product.name} (${product.category}) for KES ${product.price.toLocaleString(
      "en-KE"
    )}.`;

    const url = `https://wa.me/${
      COMPANY.whatsapp
    }?text=${encodeURIComponent(message)}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (loading) {
    return <ProductSkeleton />;
  }

  if (error || !product) {
    return <ProductNotFound />;
  }

  return (
    <main>
      {/* Breadcrumb */}
      <SectionWrapper compact>
        <Breadcrumb
          items={[
            {
              label: "Home",
              href: "/",
            },
            {
              label: "Shop",
              href: "/shop",
            },
            ...(product.category
              ? [
                  {
                    label: product.category,
                    href: `/categories/${product.category
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`,
                  },
                ]
              : []),
            {
              label: product.name,
            },
          ]}
        />
      </SectionWrapper>

      {/* Product */}
      <SectionWrapper>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <motion.div
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.4,
            }}
          >
            <ProductGallery product={product} />
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.4,
              delay: 0.1,
            }}
            className="flex flex-col gap-6"
          >
            <ProductHeader product={product} />

            <ProductPurchasePanel
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onWhatsApp={handleWhatsApp}
            />
          </motion.div>
        </div>
      </SectionWrapper>

      {/* Product Information */}
      <SectionWrapper>
        <ProductTabs product={product} />
      </SectionWrapper>

      {/* Related Products */}
      {relatedProducts &&
        relatedProducts.length > 0 && (
          <SectionWrapper>
            <ProductRelated
              products={relatedProducts}
            />
          </SectionWrapper>
        )}
    </main>
  );
}