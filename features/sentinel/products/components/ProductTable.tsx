"use client";

import Link from "next/link";
import { SafeImage } from "@/components/shared/SafeImage";
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
import { useState } from "react";

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

const STATUS_LABELS: Record<ProductStatus, string> = {
  active: "Active",
  draft: "Draft",
  out_of_stock: "Out of Stock",
  archived: "Archived",
};

function stockLabel(stock: number) {
  if (stock === 0) return { text: "Out", variant: "destructive" as const };
  if (stock < 10)
    return { text: `${stock} left`, variant: "secondary" as const };
  return { text: `${stock}`, variant: "outline" as const };
}

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
  const selectedSet = new Set(selectedIds);
  const allSelected =
    products.length > 0 &&
    products.every((product) => selectedSet.has(product.id));
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        No products found
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) =>
                      onToggleSelectAll?.(Boolean(checked))
                    }
                  />
                </TableHead>
              )}
              <TableHead className="min-w-[180px] text-sm font-medium">
                Product
              </TableHead>
              <TableHead className="hidden lg:table-cell text-sm font-medium">
                Category
              </TableHead>
              <TableHead className="hidden xl:table-cell text-sm font-medium">
                Brand
              </TableHead>
              <TableHead className="text-sm font-medium">Price</TableHead>
              <TableHead className="hidden sm:table-cell text-sm font-medium">
                Stock
              </TableHead>
              <TableHead className="hidden lg:table-cell text-sm font-medium">
                Status
              </TableHead>
              {!compact && (
                <TableHead className="text-right text-sm font-medium">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {products.map((product, index) => {
              const stock = stockLabel(product.stock);
              const status = (product.status ?? "active") as ProductStatus;
              const normalizedImage =
                typeof product.image === "string"
                  ? product.image.trim()
                  : product.image?.src;
              const hasValidImage = Boolean(normalizedImage);
              const rowKey = product.id || `product-${index}`;
              const discount = getDiscountPercent(
                product.price,
                product.compareAtPrice,
              );
              const isSelected = selectedSet.has(product.id);

              return (
                <TableRow
                  key={rowKey}
                  data-state={isSelected ? "selected" : undefined}
                >
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          onToggleSelect?.(product.id, Boolean(checked))
                        }
                      />
                    </TableCell>
                  )}

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                        <SafeImage
                          src={hasValidImage ? normalizedImage : null}
                          alt={product.name}
                          fill
                          preset="thumbnail"
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="truncate text-sm font-medium">
                            {product.name}
                          </p>
                          {product.featured && (
                            <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                          )}
                          {product.isNewArrival && (
                            <Badge
                              variant="default"
                              className="h-4 gap-0.5 px-1 text-[10px]"
                            >
                              <Sparkles className="h-2.5 w-2.5" />
                              NEW
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {product.category}
                  </TableCell>

                  <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                    {product.brand || "—"}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {formatKES(product.price)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="line-through">
                            {formatKES(product.compareAtPrice)}
                          </span>
                          {discount && (
                            <Badge
                              variant="destructive"
                              className="h-4 px-1 text-[10px]"
                            >
                              -{discount}%
                            </Badge>
                          )}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={stock.variant} className="text-xs">
                      {stock.text}
                    </Badge>
                  </TableCell>

                  <TableCell className="hidden lg:table-cell">
                    <Badge variant={STATUS_VARIANT[status]} className="text-xs">
                      {STATUS_LABELS[status]}
                    </Badge>
                  </TableCell>

                  {!compact && (
                    <TableCell>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button size="sm" className="h-8 w-8 p-0" />
                            }
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem>
                              <Link
                                href={`/products/${product.id}`}
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link
                                href={`/sentinel/products/${product.id}/edit`}
                                className="flex items-center gap-2"
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDuplicate?.(product)}
                            >
                              <Copy className="h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => onDelete?.(product)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden p-2 space-y-2">
        {products.map((product, index) => {
          const stock = stockLabel(product.stock);
          const status = (product.status ?? "active") as ProductStatus;
          const normalizedImage =
            typeof product.image === "string"
              ? product.image.trim()
              : product.image?.src;
          const hasValidImage = Boolean(normalizedImage);
          const rowKey = product.id || `product-${index}`;
          const discount = getDiscountPercent(
            product.price,
            product.compareAtPrice,
          );
          const isSelected = selectedSet.has(product.id);
          const isExpanded = expandedRow === product.id;

          return (
            <Card
              key={rowKey}
              className={cn(
                "border-border/70 p-2 shadow-sm transition-all duration-200",
                isExpanded && "border-primary/30 shadow-md",
              )}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  {/* Selectable checkbox */}
                  {selectable && (
                    <div className="pt-0.5">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          onToggleSelect?.(product.id, Boolean(checked))
                        }
                        className="h-4 w-4"
                      />
                    </div>
                  )}

                  {/* Product image */}
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                    <SafeImage
                      src={hasValidImage ? normalizedImage : null}
                      alt={product.name}
                      fill
                      preset="thumbnail"
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>

                  {/* Product info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-medium truncate">
                            {product.name}
                          </p>
                          {product.featured && (
                            <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                          )}
                          {product.isNewArrival && (
                            <Badge
                              variant="default"
                              className="h-3.5 px-1 text-[8px]"
                            >
                              <Sparkles className="h-2 w-2" />
                              NEW
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {product.category}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-medium">
                          {formatKES(product.price)}
                        </p>
                        {product.compareAtPrice && discount && (
                          <Badge
                            variant="destructive"
                            className="h-3.5 px-1 text-[8px]"
                          >
                            -{discount}%
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Bottom row: stock, status, actions */}
                    <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={stock.variant}
                          className="text-[10px] px-1.5 py-0 h-4"
                        >
                          {stock.text}
                        </Badge>
                        <Badge
                          variant={STATUS_VARIANT[status]}
                          className="text-[10px] px-1.5 py-0 h-4"
                        >
                          {STATUS_LABELS[status]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
                        >
                          <Link href={`/sentinel/products/${product.id}/edit`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => onDelete?.(product)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => toggleRow(product.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expandable details */}
                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t border-border/50 animate-in slide-in-from-top-1 duration-200">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Brand</span>
                            <span className="font-medium">
                              {product.brand || "—"}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">SKU</span>
                            <span className="font-medium">
                              {product.sku || "—"}
                            </span>
                          </div>
                          {product.compareAtPrice && (
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                Compare at
                              </span>
                              <span className="font-medium line-through">
                                {formatKES(product.compareAtPrice)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              Created
                            </span>
                            <span className="font-medium">
                              {product.createdAt
                                ? formatDate(product.createdAt)
                                : "—"}
                            </span>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex h-7 w-auto text-xs"
                            >
                              <Link
                                className="w-auto flex"
                                href={`/products/${product.id}`}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-7 text-xs"
                              onClick={() => onDuplicate?.(product)}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Duplicate
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
