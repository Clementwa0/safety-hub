"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { getAvailableQuantity, type Product } from "@/types/product";
import { SafeImage } from "@/components/shared/SafeImage";
import { Star, Package, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  product: Product;
  selectedVariantImage?: string;
}

export function ProductGallery({ product, selectedVariantImage }: ProductGalleryProps) {
  const availableStock = getAvailableQuantity(product);
  const baseImages = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  const images = selectedVariantImage
    ? [selectedVariantImage, ...baseImages.filter((image) => image !== selectedVariantImage)]
    : baseImages;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
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
    setIsZoomed(false);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !hasMultipleImages) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImage();
      else previousImage();
    }
    setTouchStart(null);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Main Image */}
      <div 
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-sm"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="relative aspect-square cursor-pointer"
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

        {/* Navigation */}
        {hasMultipleImages && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); previousImage(); }}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 sm:p-2 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 sm:p-2 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700" />
            </button>

            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-medium text-white backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}

        {/* Badges */}
        <div className="absolute left-3 sm:left-4 top-3 sm:top-4 flex flex-col gap-1.5 sm:gap-2">
          {product.featured && (
            <Badge variant="secondary" className="flex items-center gap-1 text-[10px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1">
              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Featured
            </Badge>
          )}
          {product.isNewArrival && (
            <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 flex items-center gap-1 text-[10px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1">
              <Package className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              New
            </Badge>
          )}
          {availableStock === 0 && (
            <Badge variant="destructive" className="flex items-center gap-1 text-[10px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1">
              <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Stock Count */}
        {availableStock > 0 && availableStock < 10 && (
          <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-white/95 backdrop-blur-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-sm border border-slate-100">
            <span className="text-[9px] sm:text-xs font-medium text-orange-600">
              Only {availableStock} left
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultipleImages && (
        <div className="grid grid-cols-4 gap-2 sm:gap-3 md:grid-cols-5">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg sm:rounded-xl border-2 transition-all",
                currentIndex === index 
                  ? "border-secondary ring-2 ring-secondary/20 ring-offset-1" 
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
                <div className="absolute inset-0 border-2 border-secondary rounded-lg" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
