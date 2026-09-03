"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Copy,
  Eye,
  MoreHorizontal,
  Pencil,
  Sparkles,
  Star,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatKES } from "@/lib/format";
import {
  getDiscountPercent,
  hasVariants,
  PRODUCT_STATUS_LABELS,
  type Product,
  type ProductStatus,
} from "@/types/product";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

const STATUS_VARIANT: Record<ProductStatus, BadgeVariant> = {
  active: "default",
  draft: "secondary",
  out_of_stock: "destructive",
  archived: "outline",
};

const stockLabel = (stock: number) => {
  if (stock === 0) return { text: "Out", variant: "destructive" as const };
  if (stock < 10) return { text: `${stock}`, variant: "secondary" as const };
  return { text: `${stock}`, variant: "outline" as const };
};

// ----- shared sub‑components -----
const ProductBadges = ({
  featured,
  isNewArrival,
}: {
  featured?: boolean;
  isNewArrival?: boolean;
}) => (
  <div className="flex items-center gap-0.5">
    {featured && <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />}
    {isNewArrival && (
      <Badge variant="default" className="h-3.5 px-1 text-[8px] leading-none">
        <Sparkles className="h-2 w-2" /> NEW
      </Badge>
    )}
  </div>
);

const MAX_VARIANT_SIZES_SHOWN = 4;

/** "4 variants · S · M · XL · XXL" - omitted entirely for simple products. */
const VariantsBadge = ({ product }: { product: Product }) => {
  if (!hasVariants(product)) return null;
  const sizes = product.variants!.map((v) => v.size).filter(Boolean);
  const shown = sizes.slice(0, MAX_VARIANT_SIZES_SHOWN);
  const remainder = sizes.length - shown.length;
  const label = [
    `${product.variants!.length} variant${product.variants!.length === 1 ? "" : "s"}`,
    ...shown,
  ].join(" · ");

  return (
    <Badge variant="outline" className="mt-0.5 h-3.5 w-fit px-1 text-[8px] font-normal leading-none">
      {label}
      {remainder > 0 ? ` +${remainder}` : ""}
    </Badge>
  );
};

const ProductPrice = ({ price, compareAtPrice }: { price: number; compareAtPrice?: number }) => {
  const discount = getDiscountPercent(price, compareAtPrice);
  return (
    <div className="flex flex-col leading-none">
      <span className="text-sm font-medium">{formatKES(price)}</span>
      {compareAtPrice && (
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="line-through">{formatKES(compareAtPrice)}</span>
          {discount && (
            <Badge variant="destructive" className="h-3.5 px-1 text-[8px] leading-none">
              -{discount}%
            </Badge>
          )}
        </span>
      )}
    </div>
  );
};

// ----- main component -----
interface ProductTableProps {
  products: Product[];
  onDelete?: (product: Product) => void;
  onDuplicate?: (product: Product) => void;
  compact?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string, selected: boolean) => void;
  onToggleSelectAll?: (selected: boolean) => void;
  loading?: boolean;
}

export default function ProductTable({
  products,
  onDelete,
  onDuplicate,
  compact = false,
  selectable = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  loading = false,
}: ProductTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const toggleRow = (id: string) => setExpandedRow(prev => prev === id ? null : id);
  const selectedSet = new Set(selectedIds);
  const allSelected = products.length > 0 && products.every(p => selectedSet.has(p.id));

  if (loading) {
    return (
      <div className="space-y-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-full animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        No products found
      </div>
    );
  }

  const renderProduct = (product: Product, index: number, isMobile: boolean) => {
    const stock = stockLabel(product.stock);
    const status = (product.status ?? "active") as ProductStatus;
    const isSelected = selectedSet.has(product.id);
    const isExpanded = expandedRow === product.id && isMobile;
    const rowKey = product.id || `product-${index}`;

    const productInfo = (
      <div className="flex items-center gap-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-medium leading-tight">{product.name}</p>
            <ProductBadges featured={product.featured} isNewArrival={product.isNewArrival} />
          </div>
          <VariantsBadge product={product} />
        </div>
      </div>
    );

    const priceCell = <ProductPrice price={product.price} compareAtPrice={product.compareAtPrice} />;

    const statusBadge = (
      <Badge variant={STATUS_VARIANT[status]} className="text-[10px] px-1.5 py-0 h-4">
        {PRODUCT_STATUS_LABELS[status]}
      </Badge>
    );

    const actionsMenu = !compact && (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="sm" className="h-7 w-7 p-0" />}>
          <MoreHorizontal className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem className="text-xs">
            <Link href={`/products/${product.id}`} className="flex items-center gap-2">
              <Eye className="h-3.5 w-3.5" /> View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-xs">
            <Link href={`/sentinel/products/${product.id}/edit`} className="flex items-center gap-2">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDuplicate?.(product)} className="text-xs">
            <Copy className="h-3.5 w-3.5" /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onDelete?.(product)}
            className="text-xs text-destructive focus:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    // ---- desktop row ----
    if (!isMobile) {
      return (
        <TableRow key={rowKey} data-state={isSelected ? "selected" : undefined} className="h-12">
          {selectable && (
            <TableCell className="py-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={c => onToggleSelect?.(product.id, Boolean(c))}
                className="h-3.5 w-3.5"
              />
            </TableCell>
          )}
          <TableCell className="py-1">{productInfo}</TableCell>
          <TableCell className="hidden lg:table-cell py-1 text-xs text-muted-foreground">
            {product.category}
          </TableCell>
          <TableCell className="hidden xl:table-cell py-1 text-xs text-muted-foreground">
            {product.brand || "-"}
          </TableCell>
          <TableCell className="py-1">{priceCell}</TableCell>
          <TableCell className="hidden sm:table-cell py-1">
            <Badge variant={stock.variant} className="text-[10px] px-1.5 py-0 h-4">
              {stock.text}
            </Badge>
          </TableCell>
          <TableCell className="hidden lg:table-cell py-1">{statusBadge}</TableCell>
          {!compact && <TableCell className="py-1 text-right">{actionsMenu}</TableCell>}
        </TableRow>
      );
    }

    // ---- mobile card ----
    return (
      <Card
        key={rowKey}
        className={cn(
          "shadow-sm transition-all duration-200",
          isExpanded && "border-primary/30 shadow-md"
        )}
      >
        <CardContent className="p-2">
          <div className="flex items-start gap-2">
            {selectable && (
              <div className="pt-0.5">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={c => onToggleSelect?.(product.id, Boolean(c))}
                  className="h-3.5 w-3.5"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-1.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-xs font-medium leading-tight">{product.name}</p>
                    <ProductBadges featured={product.featured} isNewArrival={product.isNewArrival} />
                  </div>
                  <VariantsBadge product={product} />
                </div>
                <div className="shrink-0 text-right">{priceCell}</div>
              </div>
              <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/40">
                <div className="flex items-center gap-1.5">
                  <Badge variant={stock.variant} className="text-[9px] px-1.5 py-0 h-3.5">
                    {stock.text}
                  </Badge>
                  {statusBadge}
                </div>
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary"
                  >
                    <Link href={`/sentinel/products/${product.id}/edit`}>
                      <Pencil className="h-3 w-3" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete?.(product)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => toggleRow(product.id)}
                  >
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              {isExpanded && (
                <div className="mt-1.5 pt-1.5 border-t border-border/40 animate-in slide-in-from-top-1 duration-150">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium text-right truncate">{product.category}</span>
                    {product.brand && (
                      <>
                        <span className="text-muted-foreground">Brand</span>
                        <span className="font-medium text-right truncate">{product.brand}</span>
                      </>
                    )}
                    {product.sku && (
                      <>
                        <span className="text-muted-foreground">SKU</span>
                        <span className="font-medium text-right truncate">{product.sku}</span>
                      </>
                    )}
                    {product.compareAtPrice && (
                      <>
                        <span className="text-muted-foreground">Compare at</span>
                        <span className="font-medium text-right line-through">{formatKES(product.compareAtPrice)}</span>
                      </>
                    )}
                    {product.createdAt && (
                      <>
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium text-right">{formatDate(product.createdAt)}</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-1.5 mt-1.5">
                    <Button variant="outline" size="sm" className="flex-1 h-6 text-[10px]" >
                      <Link href={`/products/${product.id}`}>
                        <Eye className="h-2.5 w-2.5 mr-1" /> View
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-6 text-[10px]"
                      onClick={() => onDuplicate?.(product)}
                    >
                      <Copy className="h-2.5 w-2.5 mr-1" /> Duplicate
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ----- render -----
  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden md:block w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="h-9">
              {selectable && (
                <TableHead className="w-8">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={c => onToggleSelectAll?.(Boolean(c))}
                    className="h-3.5 w-3.5"
                  />
                </TableHead>
              )}
              <TableHead className="min-w-[160px] text-xs font-medium">Product</TableHead>
              <TableHead className="hidden lg:table-cell text-xs font-medium">Category</TableHead>
              <TableHead className="hidden xl:table-cell text-xs font-medium">Brand</TableHead>
              <TableHead className="text-xs font-medium">Price</TableHead>
              <TableHead className="hidden sm:table-cell text-xs font-medium">Stock</TableHead>
              <TableHead className="hidden lg:table-cell text-xs font-medium">Status</TableHead>
              {!compact && <TableHead className="text-right text-xs font-medium">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>{products.map((p, i) => renderProduct(p, i, false))}</TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-1.5">{products.map((p, i) => renderProduct(p, i, true))}</div>
    </div>
  );
}