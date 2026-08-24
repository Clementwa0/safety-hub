"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types/product";
import { SafeImage } from "@/components/shared/SafeImage";
import { Star, Package, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  product: Product;
  /** When set (the customer picked a size with its own photo), that image
   *  becomes the active view instead of the product's default gallery order. */
  selectedVariantImage?: string;
}

export function ProductGallery({ product, selectedVariantImage }: ProductGalleryProps) {
  const baseImages = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  // Bring the selected variant's photo to the front of the gallery (and add
  // it if it isn't already one of the product's images) so it becomes the
  // hero shot the moment a size with its own image is picked.
  const images = selectedVariantImage
    ? [
        selectedVariantImage,
        ...baseImages.filter((image) => image !== selectedVariantImage),
      ]
    : baseImages;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    // Jump back to the hero shot whenever the selected variant's image
    // changes, rather than leaving the viewer on whatever index the
    // customer had scrolled to for the previous size.
    setCurrentIndex(0);
    setIsZoomed(false);
  }, [selectedVariantImage]);

  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const selectImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        {/* Main Image */}
        <div 
          className="relative aspect-square cursor-zoom-in"
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <SafeImage
            src={images[currentIndex]}
            alt={`${product.name} - Image ${currentIndex + 1}`}
            fill
            preset="productHero"
            priority
            className={cn(
              "object-contain transition-transform duration-300",
              isZoomed && "scale-150 cursor-zoom-out"
            )}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Navigation Arrows - Only show if multiple images */}
        {hasMultipleImages && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                previousImage();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-slate-700" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-slate-700" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}

        {/* Status Badges */}
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {product.featured && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              Featured
            </Badge>
          )}

          {product.isNewArrival && (
            <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 flex items-center gap-1">
              <Package className="h-3 w-3" />
              New
            </Badge>
          )}

          {product.stock === 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Out of Stock
            </Badge>
          )}

          {product.stock > 0 && product.stock < 10 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Low Stock
            </Badge>
          )}
        </div>

        {/* Stock Count Badge */}
        {product.stock > 0 && (
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
            <span className="text-xs font-medium text-slate-600">
              {product.stock} in stock
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail Grid - Only show if multiple images */}
      {hasMultipleImages && (
        <div className="grid grid-cols-4 gap-3 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl border-2 transition-all hover:border-blue-400",
                currentIndex === index 
                  ? "border-blue-500 ring-2 ring-blue-200 ring-offset-1" 
                  : "border-slate-200 hover:border-slate-300"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <SafeImage
                src={image}
                alt={`${product.name} thumbnail ${index + 1}`}
                fill
                preset="thumbnail"
                className="object-cover"
                sizes="(max-width: 768px) 20vw, 10vw"
              />
              {currentIndex === index && (
                <div className="absolute inset-0 border-2 border-blue-500 rounded-xl" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}