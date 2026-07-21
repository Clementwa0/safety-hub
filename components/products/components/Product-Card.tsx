"use client";

import SharedProductCard from "@/components/shared/ProductCard";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export default function ProductCard({ product, featured = false }: ProductCardProps) {
  return <SharedProductCard product={product} featured={featured} showActionText />;
}