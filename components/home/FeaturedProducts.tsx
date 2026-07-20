"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  FaStar, 
  FaStarHalfAlt, 
  FaRegStar,
  FaShoppingCart,
  FaEye,
  FaArrowRight
} from "react-icons/fa";
import { PRODUCTS } from "@/data/products";

import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Rating component
const Rating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={`full-${i}`} className="h-3.5 w-3.5 text-amber-400" />
      ))}
      {hasHalfStar && <FaStarHalfAlt className="h-3.5 w-3.5 text-amber-400" />}
      {[...Array(emptyStars)].map((_, i) => (
        <FaRegStar key={`empty-${i}`} className="h-3.5 w-3.5 text-gray-300" />
      ))}
      <span className="ml-1 text-xs font-medium text-gray-500">
        ({rating.toFixed(1)})
      </span>
    </div>
  );
};

// Product Card Component
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    rating: number;
    reviews: number;
    image: string;
    category: string;
    featured?: boolean;
    inStock?: boolean;
    badge?: string;
  };
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  const isInStock = product.inStock !== false;
  const discount = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="h-full"
    >
      <Card className="group relative h-full overflow-hidden border border-gray-200/60 bg-white transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
        {/* Badge */}
        {(product.badge || discount > 0) && (
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
            {product.badge && (
              <Badge className="border-0 bg-gray-900 text-white font-medium text-xs px-2.5 py-1">
                {product.badge}
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="border-0 bg-amber-500 text-white font-medium text-xs px-2.5 py-1">
                -{discount}%
              </Badge>
            )}
          </div>
        )}

        {/* Stock Status */}
        {!isInStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <Badge className="border-0 bg-gray-900/90 text-white font-medium text-sm px-4 py-2">
              Out of Stock
            </Badge>
          </div>
        )}

        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          
          {/* Quick Action Overlay */}
          <div className="absolute inset-x-0 bottom-0 flex translate-y-full justify-center gap-2 bg-gradient-to-t from-black/60 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
            <Button
              size="sm"
              className="gap-1.5 bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 transition-all duration-300"
            >
              <FaShoppingCart className="h-3.5 w-3.5" />
              Add to Cart
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 bg-white/90 text-gray-700 hover:bg-white hover:scale-105 transition-all duration-300"
            >
              <FaEye className="h-3.5 w-3.5" />
              Quick View
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Category */}
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            {product.category}
          </p>

          {/* Product Name */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold text-gray-800 transition-colors duration-300 hover:text-gray-900">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-2">
            <Rating rating={product.rating} />
            <span className="text-xs text-gray-400">
              ({product.reviews})
            </span>
          </div>

          {/* Price */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              KSh {product.price.toLocaleString()}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-gray-400 line-through">
                KSh {product.compareAtPrice.toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button 
            className="w-full gap-2 bg-gray-900 text-white hover:bg-gray-800 transition-all duration-300 hover:shadow-md"
            disabled={!isInStock}
          >
            <FaShoppingCart className="h-4 w-4" />
            {isInStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

// Section Header Component
const SectionHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => {
  return (
    <div className="space-y-2">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base text-gray-500 max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
};

// Main Component
export default function FeaturedProducts() {
  const featuredProducts = PRODUCTS.filter((product) => product.featured).slice(0, 4);

  return (
    <section className="bg-gray-50/50 py-16 lg:py-20">
      <div className="container px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            title="Featured Products"
            subtitle="Explore our most popular personal protective equipment and industrial safety solutions trusted by professionals across Kenya."
          />
          <Link
            href="/products"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 transition-all duration-300 hover:text-gray-900"
          >
            View All Products
            <FaArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}