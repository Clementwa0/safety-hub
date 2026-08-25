'use client'

import { useState } from 'react'
import type { StaticImageData } from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { AiOutlineEye } from 'react-icons/ai'
import {
  FaCartPlus,
  FaCircleCheck,
  FaTriangleExclamation,
} from 'react-icons/fa6'
import { toast } from 'sonner'

import { SafeImage } from '@/components/shared/SafeImage'
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

export default function ProductCard({
  product,
  featured,
  priority = false,
  compact = false,
  showActionText = false,
  className,
}: ProductCardProps) {
  const { addItem } = useCart()
  const router = useRouter()
  const reduceMotion = useReducedMotion()

  const [adding, setAdding] = useState(false)

  const {
    id,
    name,
    category,
    price,
    image,
    stock,
    brand,
    compareAtPrice,
    hasVariants,
    isNewArrival,
  } = product

  const isVariant = Boolean(hasVariants)
  const isInStock = stock > 0
  const isOutOfStock = !isVariant && !isInStock
  const isLowStock = !isVariant && isInStock && stock < 10
  const isFeatured = featured ?? product.featured ?? false

  const isDiscounted =
    typeof compareAtPrice === 'number' && compareAtPrice > price

  const discount = isDiscounted
    ? getDiscountPercent(price, compareAtPrice)
    : null

  const productHref = `/products/${id}`

  // Ultra compact spacing
  const contentSpacing = compact ? 'p-1.5' : 'p-3'
  const gap = compact ? 'gap-0.5' : 'gap-1'
  const nameSize = compact ? 'text-[11px] leading-tight' : 'text-sm sm:text-base leading-snug'
  const badgeSize = compact ? 'px-1 py-0.5 text-[6px]' : 'px-2 py-0.5 text-[8px]'
  const priceSize = compact ? 'text-sm' : 'text-base sm:text-lg'
  const comparePriceSize = compact ? 'text-[9px]' : 'text-xs sm:text-sm'
  const labelSize = compact ? 'text-[7px]' : 'text-[8px]'

  const handleAction = async () => {
    if (isVariant) {
      router.push(productHref)
      return
    }

    if (isOutOfStock) {
      toast.error('This product is currently out of stock')
      return
    }

    if (adding) return

    setAdding(true)

    try {
      await addItem(id, undefined, 1)
      toast.success(`${name} added to cart`)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not add this product to cart'
      )
    } finally {
      setAdding(false)
    }
  }

  const actionDisabled = adding || isOutOfStock

  return (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-lg',
        'border border-gray-200/80 bg-white shadow-sm',
        'transition-all duration-200 ease-out',
        'hover:border-gray-300 hover:shadow-md',
        className
      )}
    >
      <Link
        href={productHref}
        aria-label={`View ${name}`}
        className="block flex-1"
      >
        {/* Product image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100/50">
          <SafeImage
            src={image}
            alt={name}
            fill
            preset="card"
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            quality={85}
            sizes="(max-width:480px) 45vw, (max-width:640px) 40vw, (max-width:768px) 30vw, (max-width:1024px) 22vw, 18vw"
            className={cn(
              'object-cover transition-transform duration-500',
              !reduceMotion && 'group-hover:scale-[1.04]'
            )}
          />

          {/* Image badges - compact */}
          <div className="pointer-events-none absolute inset-x-1 top-1 flex items-start justify-between gap-0.5">
            {/* Left badges */}
            <div className="flex max-w-[60%] flex-wrap gap-0.5">
              {isFeatured && (
                <Badge variant="secondary" className={badgeSize}>
                  Featured
                </Badge>
              )}
              {isNewArrival && (
                <Badge variant="blue" className={badgeSize}>
                  New
                </Badge>
              )}
            </div>

            {/* Right badges */}
            <div className="flex max-w-[40%] flex-wrap justify-end gap-0.5">
              {isOutOfStock && (
                <Badge variant="danger" className={badgeSize}>
                  Out
                </Badge>
              )}
              {isDiscounted && discount !== null && (
                <Badge variant="danger" className={badgeSize}>
                  -{discount}%
                </Badge>
              )}
            </div>
          </div>

          {/* Quick view overlay - smaller */}
          <div className="pointer-events-none absolute inset-x-2 bottom-2 hidden sm:block">
            <span
              className={cn(
                'flex items-center justify-center gap-1',
                'rounded-md bg-black/60 px-2 py-1',
                'text-[8px] font-medium text-white',
                'opacity-0 backdrop-blur-sm',
                'transition-all duration-200',
                'group-hover:opacity-100'
              )}
            >
              <AiOutlineEye className="text-[10px]" aria-hidden="true" />
              Quick View
            </span>
          </div>
        </div>

        {/* Product information - ultra compact */}
        <div className={cn('flex flex-col', contentSpacing, gap)}>
          {/* Brand + category row */}
          <div className="flex min-w-0 items-center justify-between gap-1">
            {brand ? (
              <p className={cn('min-w-0 truncate font-semibold uppercase tracking-wider text-muted-foreground/60', labelSize)}>
                {brand}
              </p>
            ) : (
              <span />
            )}
            <p className={cn('shrink-0 truncate font-medium text-muted-foreground/50', labelSize)}>
              {category}
            </p>
          </div>

          {/* Product name */}
          <h3
            className={cn(
              'line-clamp-2 font-semibold text-gray-900',
              'transition-colors duration-200',
              'group-hover:text-secondary',
              nameSize
            )}
          >
            {name}
          </h3>

          {/* Stock status - compact */}
          <StockStatus
            isVariant={isVariant}
            isInStock={isInStock}
            isLowStock={isLowStock}
            stock={stock}
            compact={compact}
          />
        </div>
      </Link>

      {/* Footer - ultra compact */}
      <div
        className={cn(
          'mt-auto flex items-center justify-between gap-1.5',
          'border-t border-gray-100/80',
          contentSpacing
        )}
      >
        <Price
          price={price}
          compareAtPrice={compareAtPrice}
          compact={compact}
          priceSize={priceSize}
          comparePriceSize={comparePriceSize}
        />

        <button
          type="button"
          onClick={() => void handleAction()}
          disabled={actionDisabled}
          aria-label={
            isVariant
              ? `Select options for ${name}`
              : isOutOfStock
                ? `${name} is out of stock`
                : `Add ${name} to cart`
          }
          className={cn(
            'flex shrink-0 items-center justify-center gap-1',
            'rounded-md px-2 py-1',
            'text-[9px] font-semibold',
            'transition-all duration-200',
            'active:scale-95',
            'focus-visible:outline-none',
            'focus-visible:ring-2 focus-visible:ring-secondary/40',
            'focus-visible:ring-offset-1',
            actionDisabled
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-secondary text-white hover:bg-secondary/90 hover:shadow-sm'
          )}
        >
          <FaCartPlus
            className={compact ? 'text-[9px]' : 'text-xs'}
            aria-hidden="true"
          />

          {showActionText && (
            <span className="hidden whitespace-nowrap sm:inline">
              {adding
                ? 'Adding...'
                : isVariant
                  ? 'Select Size'
                  : isOutOfStock
                    ? 'Out'
                    : 'Add'}
            </span>
          )}
        </button>
      </div>
    </motion.article>
  )
}

/* -------------------------------------------------------------------------- */
/* Internal UI primitives                                                     */
/* -------------------------------------------------------------------------- */

function Badge({
  children,
  variant,
  className,
}: {
  children: React.ReactNode
  variant: 'secondary' | 'blue' | 'danger'
  className?: string
}) {
  const variantStyles = {
    secondary: 'bg-secondary text-white',
    blue: 'bg-blue-500 text-white',
    danger: 'bg-red-500 text-white',
  }

  return (
    <span
      className={cn(
        'rounded font-semibold uppercase leading-none tracking-wide shadow-sm',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

function StockStatus({
  isVariant,
  isInStock,
  isLowStock,
  stock,
  compact,
}: {
  isVariant: boolean
  isInStock: boolean
  isLowStock: boolean
  stock: number
  compact: boolean
}) {
  const textSize = compact ? 'text-[7px]' : 'text-[10px]'
  const iconSize = compact ? 'text-[7px]' : 'text-[9px]'

if (isVariant) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded',
        'bg-blue-50 px-1.5 py-0.5',
        'font-semibold text-blue-700',
        'ring-1 ring-blue-200',
        textSize
      )}
    >
      <svg
        className="h-2.5 w-2.5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 11-18 0"
        />
      </svg>

      <span>Multiple sizes</span>
    </span>
  )
}

  if (!isInStock) {
    return (
      <span className={cn('font-medium text-red-500', textSize)}>
        Out of Stock
      </span>
    )
  }

  if (isLowStock) {
    return (
      <span
        className={cn(
          'flex items-center gap-0.5 font-medium text-orange-600',
          textSize
        )}
      >
        <FaTriangleExclamation className={cn('shrink-0', iconSize)} aria-hidden="true" />
        {compact ? `${stock} left` : `Only ${stock} left`}
      </span>
    )
  }

  return (
    <span className={cn('flex items-center gap-0.5 font-medium text-green-600', textSize)}>
      <FaCircleCheck className={cn('shrink-0', iconSize)} aria-hidden="true" />
      {compact ? 'In Stock' : 'In Stock'}
    </span>
  )
}

function Price({
  price,
  compareAtPrice,
  priceSize,
  comparePriceSize,
}: {
  price: number
  compareAtPrice?: number
  compact: boolean
  priceSize: string
  comparePriceSize: string
}) {
  const isDiscounted =
    typeof compareAtPrice === 'number' && compareAtPrice > price

  return (
    <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
      <span
        className={cn(
          'whitespace-nowrap font-bold leading-none tracking-tight text-secondary',
          priceSize
        )}
      >
        {formatKES(price)}
      </span>

      {isDiscounted && (
        <span
          className={cn(
            'whitespace-nowrap font-medium leading-none',
            'text-muted-foreground/50 line-through',
            comparePriceSize
          )}
        >
          {formatKES(compareAtPrice)}
        </span>
      )}
    </div>
  )
}