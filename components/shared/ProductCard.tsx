"use client";

import Image from "next/image";
import type { StaticImageData } from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { AiOutlineEye } from "react-icons/ai";
import { FaCartPlus } from "react-icons/fa6";
import { toast } from "sonner";

import { formatKES } from "@/lib/format";
import { toCartProduct } from "@/lib/cart";
import { useCartStore } from "@/store/cart-store";

export interface ProductCardItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string | StaticImageData;
  stock: number;
  featured?: boolean;
  description?: string;
  subcategory?: string;
}

export interface ProductCardProps {
  product: ProductCardItem;
  featured?: boolean;
  compact?: boolean;
  showActionText?: boolean;
  className?: string;
}

export default function ProductCard({
  product,
  featured = false,
  compact = false,
  showActionText = false,
  className = "",
}: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const openCart = useCartStore((state) => state.openCart);

  const handleAddToCart = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    addToCart(toCartProduct(product));
    openCart();
    toast.success("Product added to cart");
  };

  const stockBadge =
    product.stock === 0 ? (
      <span className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[8px] font-semibold text-white shadow-sm">
        Out of Stock
      </span>
    ) : product.stock < 10 ? (
      <span className="absolute right-2 top-2 rounded-full bg-orange-500 px-2 py-0.5 text-[8px] font-semibold text-white shadow-sm">
        Low Stock
      </span>
    ) : null;

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-md ${className}`}
    >
      <Link href={`/products/${product.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width:480px) 45vw,
                   (max-width:640px) 40vw,
                   (max-width:768px) 30vw,
                   (max-width:1024px) 22vw,
                   18vw"
            quality={85}
            loading="lazy"
          />

          {featured && (
            <span className="absolute left-2 top-2 rounded-full bg-secondary px-2 py-0.5 text-[8px] font-semibold text-white shadow-sm">
              Featured
            </span>
          )}

          {stockBadge}

          <div className="absolute bottom-2 left-2 right-2 hidden gap-2 opacity-0 transition-opacity duration-300 group-hover:flex group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/products/${product.id}`;
              }}
              className="flex flex-1 items-center justify-center gap-1 rounded-md bg-white/95 py-1 text-[10px] font-medium text-gray-700 shadow backdrop-blur transition hover:bg-white"
            >
              <AiOutlineEye className="text-xs" />
              View Details
            </button>
          </div>
        </div>

        <div className={`flex flex-1 flex-col justify-between ${compact ? "p-2" : "p-2.5"}`}>
          <div>
            <h3 className={`line-clamp-2 min-h-[2rem] font-semibold leading-tight text-primary transition-colors hover:text-secondary ${compact ? "text-[10px]" : "text-[10px] sm:text-xs"}`}>
              {product.name}
            </h3>

            <p className={`mt-1 truncate text-muted-foreground ${compact ? "text-[8px]" : "text-[8px] sm:text-[10px]"}`}>
              {product.category}
            </p>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <span className={`font-bold text-secondary ${compact ? "text-[11px]" : "text-[11px] sm:text-sm"}`}>
              {formatKES(product.price)}
            </span>

            <button
              onClick={handleAddToCart}
              className="flex items-center gap-1 rounded-md bg-slate-600 px-1.5 py-1.5 text-[10px] font-medium text-white transition hover:bg-slate-700 active:scale-95 sm:px-3 sm:py-1.5"
              aria-label="Add to cart"
            >
              <FaCartPlus className="text-xs sm:text-sm" />
              {showActionText ? <span className="hidden sm:inline">Add</span> : null}
            </button>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
