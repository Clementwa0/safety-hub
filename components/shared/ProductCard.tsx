'use client'

import { useState } from 'react'
import type { StaticImageData } from 'next/image'
import Link from 'next/link'
import { SafeImage } from '@/components/shared/SafeImage'
import { motion, useReducedMotion } from 'framer-motion'
import { AiOutlineEye } from 'react-icons/ai'
import { FaCartPlus } from 'react-icons/fa6'
import { toast } from 'sonner'

// Swap this for wherever your clsx + tailwind-merge helper lives.
import { cn } from '@/lib/utils'

import { formatKES } from '@/lib/format'
import { useCart } from '@/hooks/useCart'
import { useCartUIStore } from '@/store/cart-ui-store'
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
}

export interface ProductCardProps {
  product: ProductCardItem
  /**
   * Force the "Featured" badge on for this render, regardless of the
   * product's own `featured` flag. When omitted, `product.featured` decides;
   * this prop always wins when provided.
   */
  featured?: boolean
  /** Mark the first few above-the-fold cards so their image loads eagerly. */
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
  const openCart = useCartUIStore(state => state.openCart)
  const shouldReduceMotion = useReducedMotion()
  const [adding, setAdding] = useState(false)

  const isFeatured = featured ?? product.featured
  const isOutOfStock = product.stock <= 0
  const isLowStock = !isOutOfStock && product.stock < 10

  const isDiscounted =
    typeof product.compareAtPrice === 'number' &&
    product.compareAtPrice > product.price
  const discount = isDiscounted
    ? getDiscountPercent(product.price, product.compareAtPrice)
    : null

  const productHref = `/products/${product.id}`

  // No preventDefault/stopPropagation needed — this button is a sibling of
  // the Link, not nested inside it.
  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast.error('This product is out of stock')
      return
    }

    setAdding(true)
    try {
      // The server is the final authority on stock limits — it re-validates
      // status/stock even though we already checked `isOutOfStock` here.
      await addItem(product.id, 1)
      openCart()
      toast.success('Product added to cart')
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
        'group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-md',
        className
      )}
    >
      <Link href={productHref} className='flex flex-col'>
        <div className='relative aspect-square overflow-hidden bg-gray-50'>
          <SafeImage
            src={product.image}
            alt={product.name}
            fill
            className='object-contain p-3 transition-transform duration-300 group-hover:scale-105'
            sizes='(max-width:480px) 45vw,
                   (max-width:640px) 40vw,
                   (max-width:768px) 30vw,
                   (max-width:1024px) 22vw,
                   18vw'
            quality={85}
            priority={priority}
            loading={priority ? undefined : 'lazy'}
          />

          {(isFeatured || product.isNewArrival) && (
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
            </div>
          )}

          {isOutOfStock && (
            <span className='absolute right-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-semibold text-white shadow-sm'>
              Out of Stock
            </span>
          )}
          {isLowStock && (
            <span className='absolute right-2 top-2 rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-semibold text-white shadow-sm'>
              Low Stock
            </span>
          )}

          {/* Hover-only visual hint on devices with real hover; hidden on
              touch (no hover state to reveal it, and the whole card already
              navigates on tap). pointer-events-none makes clear it's an
              overlay, not a second tap target. */}
          <div className='pointer-events-none absolute inset-x-2 bottom-2 hidden opacity-0 transition-opacity duration-300 sm:block sm:group-hover:opacity-100'>
            <span className='flex items-center justify-center gap-1 rounded-md bg-white/95 py-1.5 text-xs font-medium text-gray-700 shadow backdrop-blur'>
              <AiOutlineEye className='text-xs' />
              View Details
            </span>
          </div>
        </div>

        <div className={cn('flex flex-col', compact ? 'p-2' : 'p-2.5')}>
          <h3
            className={cn(
              'line-clamp-2 min-h-[2rem] font-semibold leading-tight text-primary transition-colors group-hover:text-secondary',
              compact ? 'text-xs' : 'text-xs sm:text-sm'
            )}
          >
            {product.name}
          </h3>

          <p
            className={cn(
              'mt-1 truncate text-muted-foreground',
              compact ? 'text-[10px]' : 'text-[10px] sm:text-xs'
            )}
          >
            {product.category}
          </p>
        </div>
      </Link>

      {/* Kept outside the Link to avoid nesting an interactive button inside an <a>. */}
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
          disabled={isOutOfStock || adding}
          className={cn(
            'flex items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium transition active:scale-95 sm:px-3',
            isOutOfStock || adding
              ? 'cursor-not-allowed bg-gray-200 text-gray-500 active:scale-100'
              : 'bg-slate-600 text-white hover:bg-slate-700'
          )}
          aria-label={
            isOutOfStock
              ? `${product.name} is out of stock`
              : `Add ${product.name} to cart`
          }
        >
          <FaCartPlus className='text-xs sm:text-sm' />
          {showActionText && (
            <span className='hidden sm:inline'>
              {isOutOfStock ? 'Out of Stock' : 'Add'}
            </span>
          )}
        </button>
      </div>
    </motion.article>
  )
}
