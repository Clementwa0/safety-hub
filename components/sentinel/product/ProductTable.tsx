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
import { formatDate, formatKES } from "@/lib/format";
import { getDiscountPercent, PRODUCT_STATUS_LABELS, type Product, type ProductStatus } from "@/types/product";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

const STATUS_VARIANT: Record<ProductStatus, BadgeVariant> = {
  active: "default",
  draft: "secondary",
  out_of_stock: "destructive",
  archived: "outline",
};

function stockLabel(stock: number) {
  if (stock === 0)
    return { text: "Out of stock", variant: "destructive" as const };
  if (stock < 10)
    return { text: `${stock} left`, variant: "secondary" as const };
  return { text: `${stock} in stock`, variant: "outline" as const };
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
}: ProductTableProps) {
  const selectedSet = new Set(selectedIds);
  const allSelected = products.length > 0 && products.every((product) => selectedSet.has(product.id));

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {selectable ? (
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => onToggleSelectAll?.(Boolean(checked))}
                  aria-label="Select all products"
                />
              </TableHead>
            ) : null}
            <TableHead className="min-w-[220px]">Product</TableHead>
            <TableHead className="hidden md:table-cell">Category</TableHead>
            <TableHead className="hidden lg:table-cell">Brand</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="hidden sm:table-cell">Stock</TableHead>
            <TableHead className="hidden lg:table-cell">Status</TableHead>
            <TableHead className="hidden xl:table-cell">Created</TableHead>
            {compact ? null : (
              <TableHead className="text-right">Actions</TableHead>
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
            const rowKey =
              (product as Product & { _id?: string }).id ??
              (product as Product & { _id?: string })._id ??
              `product-${index}`;
            const discount = getDiscountPercent(product.price, product.compareAtPrice);
            const isSelected = selectedSet.has(product.id);

            return (
              <TableRow key={rowKey} data-state={isSelected ? "selected" : undefined}>
                {selectable ? (
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => onToggleSelect?.(product.id, Boolean(checked))}
                      aria-label={`Select ${product.name}`}
                    />
                  </TableCell>
                ) : null}

                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                      <SafeImage
                        src={hasValidImage ? (normalizedImage as string) : null}
                        alt={product.name}
                        fill
                        preset="thumbnail"
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-medium text-foreground">
                          {product.name}
                        </p>
                        {product.featured ? (
                          <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" aria-label="Featured" />
                        ) : null}
                        {product.isNewArrival ? (
                          <Badge variant="default" className="h-4 shrink-0 gap-0.5 px-1 text-[9px]">
                            <Sparkles className="h-2.5 w-2.5" />
                            NEW
                          </Badge>
                        ) : null}
                      </div>
                      <p className="truncate text-xs text-muted-foreground md:hidden">
                        {product.category}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {product.category}
                </TableCell>

                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {product.brand || "—"}
                </TableCell>

                <TableCell className="text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium">{formatKES(product.price)}</span>
                    {product.compareAtPrice ? (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="line-through">{formatKES(product.compareAtPrice)}</span>
                        {discount !== null ? (
                          <Badge variant="destructive" className="h-4 px-1 text-[9px]">
                            -{discount}%
                          </Badge>
                        ) : null}
                      </span>
                    ) : null}
                  </div>
                </TableCell>

                <TableCell className="hidden sm:table-cell">
                  <Badge variant={stock.variant}>{stock.text}</Badge>
                </TableCell>

                <TableCell className="hidden lg:table-cell">
                  <Badge variant={STATUS_VARIANT[status]}>
                    {PRODUCT_STATUS_LABELS[status]}
                  </Badge>
                </TableCell>

                <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                  {product.createdAt ? formatDate(product.createdAt) : "—"}
                </TableCell>

                {compact ? null : (
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${product.name}`} />
                          }
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            render={<Link href={`/products/${product.id}`} />}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            render={<Link href={`/sentinel/products/${product.id}/edit`} />}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDuplicate?.(product)}>
                            <Copy className="h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete?.(product)}
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
  );
}
