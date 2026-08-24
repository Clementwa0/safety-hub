'use client'

import { useState } from 'react'
import type { StaticImageData } from 'next/image'
import Link from 'next/link'
import { SafeImage } from '@/components/shared/SafeImage'
import { motion, useReducedMotion } from 'framer-motion'
import { AiOutlineEye } from 'react-icons/ai'
import { FaCartPlus, FaStar, FaCircleCheck } from 'react-icons/fa6'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { formatKES } from '@/lib/format'
import { useCart } from '@/hooks/useCart'
import { getDiscountPercent } from '@/types/product'

export interface ProductCardItem {
  id: string
  name: string
  category: string
  price: number
  image: string | StaticImageData
  stock: number
  featured?: boolean
  description?: string
  subcategory?: string
  isNewArrival?: boolean
  compareAtPrice?: number
  brand?: string
  rating?: number
  reviews?: number
  /** True when sizes/variants must be picked on the product page before
   *  this product can be added to a cart — the card can't add it directly. */
  hasVariants?: boolean
}

export interface ProductCardProps {
  product: ProductCardItem
  featured?: boolean
  priority?: boolean
  compact?: boolean
  showActionText?: boolean
  className?: string
}

export default function ProductCard ({
  product,
  featured,
  priority = false,
  compact = false,
  showActionText = false,
  className = ''
}: ProductCardProps) {
  const { addItem } = useCart()
  const router = useRouter()
  const shouldReduceMotion = useReducedMotion()
  const [adding, setAdding] = useState(false)

  const isFeatured = featured ?? product.featured
  const isVariantProduct = Boolean(product.hasVariants)
  const isOutOfStock = product.stock <= 0
  const isInStock = product.stock > 0
  const isLowStock = !isOutOfStock && product.stock < 10

  const isDiscounted =
    typeof product.compareAtPrice === 'number' &&
    product.compareAtPrice > product.price
  const discount = isDiscounted
    ? getDiscountPercent(product.price, product.compareAtPrice)
    : null

  const productHref = `/products/${product.id}`

  const handleAddToCart = async () => {
    // Variant products must have a size chosen on the product page — the
    // card can't guess which one, so it navigates there instead of adding.
    if (isVariantProduct) {
      router.push(productHref)
      return
    }

    if (isOutOfStock) {
      toast.error('This product is out of stock')
      return
    }

    setAdding(true)
    try {
      await addItem(product.id, undefined, 1)
      toast.success(`${product.name} added to cart`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not add to cart')
    } finally {
      setAdding(false)
    }
  }

  return (
    <motion.article
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group flex flex-col overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-md',
        className
      )}
    >
      <Link href={productHref} className='flex flex-col'>
        <div className='relative aspect-square overflow-hidden bg-gray-50'>
          <SafeImage
            src={product.image}
            alt={product.name}
            fill
            preset='card'
            className='object-cover transition-transform duration-300 group-hover:scale-105'
            sizes='(max-width:480px) 45vw,
                   (max-width:640px) 40vw,
                   (max-width:768px) 30vw,
                   (max-width:1024px) 22vw,
                   18vw'
            quality={85}
            priority={priority}
            loading={priority ? undefined : 'lazy'}
          />

          {/* Badges - On top of image */}
          <div className='absolute inset-0 pointer-events-none'>
            {/* Top Left */}
            <div className='absolute left-2 top-2 flex flex-col items-start gap-1'>
              {isFeatured && (
                <span className='rounded-full bg-secondary px-2 py-0.5 text-[9px] font-semibold text-white shadow-sm'>
                  Featured
                </span>
              )}
              {product.isNewArrival && (
                <span className='rounded-full bg-sky-500 px-2 py-0.5 text-[9px] font-semibold text-white shadow-sm'>
                  NEW
                </span>
              )}
              {isInStock && !isFeatured && !product.isNewArrival && (
                <span className='rounded-full bg-green-500 px-2 py-0.5 text-[9px] font-semibold text-white shadow-sm'>
                  In Stock
                </span>
              )}
            </div>

            {/* Top Right */}
            <div className='absolute right-2 top-2 flex flex-col items-end gap-1'>
              {isOutOfStock && (
                <span className='rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-semibold text-white shadow-sm'>
                  Out of Stock
                </span>
              )}
              {isLowStock && !isOutOfStock && (
                <span className='rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-semibold text-white shadow-sm'>
                  Only {product.stock} left
                </span>
              )}
              {isInStock && isDiscounted && (
                <span className='rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-semibold text-white shadow-sm'>
                  Sale
                </span>
              )}
            </div>

            {/* Bottom - View Details overlay */}
            <div className='absolute inset-x-2 bottom-2 hidden opacity-0 transition-opacity duration-300 sm:block sm:group-hover:opacity-100'>
              <span className='flex items-center justify-center gap-1 rounded-md bg-white/95 py-1.5 text-xs font-medium text-gray-700 shadow backdrop-blur'>
                <AiOutlineEye className='text-xs' />
                View Details
              </span>
            </div>
          </div>
        </div>

        <div className={cn('flex flex-col', compact ? 'p-2' : 'p-2.5')}>
          {product.brand && (
            <p
              className={cn(
                'truncate font-medium uppercase tracking-wide text-muted-foreground/80',
                compact ? 'text-[9px]' : 'text-[9px] sm:text-[10px]'
              )}
            >
              {product.brand}
            </p>
          )}

          <h3
            className={cn(
              'line-clamp-2 min-h-[2rem] font-semibold leading-tight text-primary transition-colors group-hover:text-secondary',
              compact ? 'text-xs' : 'text-xs sm:text-sm'
            )}
          >
            {product.name}
          </h3>

          <div className='mt-1 flex items-center justify-between gap-2'>
            <p
              className={cn(
                'truncate text-muted-foreground',
                compact ? 'text-[10px]' : 'text-[10px] sm:text-xs'
              )}
            >
              {product.category}
            </p>

            {typeof product.rating === 'number' && product.rating > 0 && (
              <span
                className='flex shrink-0 items-center gap-0.5 text-[10px] font-medium text-amber-500'
                aria-label={
                  product.reviews
                    ? `Rated ${product.rating.toFixed(1)} out of 5, ${product.reviews} reviews`
                    : `Rated ${product.rating.toFixed(1)} out of 5`
                }
              >
                <FaStar className='text-[10px]' aria-hidden='true' />
                {product.rating.toFixed(1)}
                {typeof product.reviews === 'number' && product.reviews > 0 && (
                  <span className='text-muted-foreground'>({product.reviews})</span>
                )}
              </span>
            )}
          </div>

          {/* Stock status indicator */}
          <div className='mt-1.5 flex items-center gap-1.5'>
            {isInStock ? (
              <span className='flex items-center gap-1 text-[10px] font-medium text-green-600'>
                <FaCircleCheck className='text-[8px]' />
                In Stock
              </span>
            ) : (
              <span className='text-[10px] font-medium text-red-500'>Out of Stock</span>
            )}
            {isLowStock && isInStock && (
              <span className='text-[10px] text-orange-500'>
                · {product.stock} left
              </span>
            )}
          </div>
        </div>
      </Link>

      <div
        className={cn(
          'mt-auto flex items-center justify-between gap-2 border-t border-gray-100',
          compact ? 'px-2 py-2' : 'px-2.5 py-2.5'
        )}
      >
        <div className='flex flex-wrap items-center gap-1.5'>
          <span
            className={cn(
              'font-bold text-secondary',
              compact ? 'text-xs' : 'text-xs sm:text-sm'
            )}
          >
            {formatKES(product.price)}
          </span>
          {isDiscounted && discount !== null && (
            <>
              <span
                className={cn(
                  'text-muted-foreground line-through',
                  compact ? 'text-[10px]' : 'text-[10px] sm:text-xs'
                )}
              >
                {formatKES(product.compareAtPrice as number)}
              </span>
              <span className='rounded bg-red-100 px-1 py-0.5 text-[9px] font-semibold text-red-600'>
                -{discount}%
              </span>
            </>
          )}
        </div>

        <button
          type='button'
          onClick={() => void handleAddToCart()}
          disabled={(isOutOfStock && !isVariantProduct) || adding}
          className={cn(
            'flex items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium transition active:scale-95 sm:px-3',
            (isOutOfStock && !isVariantProduct) || adding
              ? 'cursor-not-allowed bg-gray-200 text-gray-500 active:scale-100'
              : 'bg-slate-600 text-white hover:bg-slate-700'
          )}
          aria-label={
            isVariantProduct
              ? `Select options for ${product.name}`
              : isOutOfStock
                ? `${product.name} is out of stock`
                : `Add ${product.name} to cart`
          }
        >
          <FaCartPlus className='text-xs sm:text-sm' />
          {showActionText && (
            <span className='hidden sm:inline'>
              {isVariantProduct ? 'Select Options' : isOutOfStock ? 'Out of Stock' : 'Add'}
            </span>
          )}
        </button>
      </div>
    </motion.article>
  )
}