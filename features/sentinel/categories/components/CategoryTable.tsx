"use client";

import {
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CategoryWithCount } from "@/types/category";

interface CategoryTableProps {
  categories: CategoryWithCount[];
  onEdit: (category: CategoryWithCount) => void;
  onDelete: (category: CategoryWithCount) => void;
  loading?: boolean;
}

export default function CategoryTable({
  categories,
  onEdit,
  onDelete,
  loading = false,
}: CategoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase().trim();
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        (category.description &&
          category.description.toLowerCase().includes(query)),
    );
  }, [categories, searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
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

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-9 text-sm"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-transparent"
              onClick={clearSearch}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
          <span>
            {filteredCategories.length}
            {filteredCategories.length !== categories.length &&
              ` of ${categories.length}`}
          </span>
          <span>categories</span>
          {searchQuery && (
            <Badge variant="secondary" className="text-xs">
              Filtered
            </Badge>
          )}
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[200px] gap-2 text-muted-foreground">
          <Search className="h-8 w-8 opacity-20" />
          <p className="text-sm">No categories found</p>
          {searchQuery && (
            <Button
              variant="link"
              size="sm"
              className="text-xs"
              onClick={clearSearch}
            >
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <div className="overflow-hidden rounded-xl border bg-background">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[24%] font-semibold">
                      Category
                    </TableHead>

                    <TableHead className="font-semibold">Description</TableHead>

                    <TableHead className="w-[100px] text-center font-semibold lg:w-[90px] xl:w-[120px]">
                      Products
                    </TableHead>

                    <TableHead className="w-[110px] text-right font-semibold lg:w-[100px] xl:w-[120px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow
                      key={category.id}
                      className="transition-colors hover:bg-muted/20"
                    >
                      {/* Category */}
                      <TableCell className="py-3 lg:py-2.5 xl:py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium lg:text-[13px] xl:text-sm">
                            {category.name}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-muted-foreground lg:text-[11px] xl:text-xs">
                            /{category.slug}
                          </p>
                        </div>
                      </TableCell>

                      {/* Description */}
                      <TableCell className="py-3 lg:py-2.5 xl:py-3">
                        <p className="max-w-xl truncate text-sm text-muted-foreground lg:text-xs xl:text-sm">
                          {category.description || "No description"}
                        </p>
                      </TableCell>

                      {/* Products */}
                      <TableCell className="py-3 text-center lg:py-2.5 xl:py-3">
                        <Badge
                          variant="secondary"
                          className="gap-1 font-medium lg:px-1.5 lg:text-[11px] xl:px-2 xl:text-xs"
                        >
                          {category.productCount}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3 lg:py-2.5 xl:py-3">
                        <div className="flex justify-end gap-0.5 lg:gap-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 lg:h-7 lg:w-7 xl:h-8 xl:w-8 hover:bg-primary/10 hover:text-primary"
                            aria-label={`Edit ${category.name}`}
                            onClick={() => onEdit(category)}
                          >
                            <Pencil className="h-4 w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4" />
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 lg:h-7 lg:w-7 xl:h-8 xl:w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Delete ${category.name}`}
                            onClick={() => onDelete(category)}
                          >
                            <Trash2 className="h-4 w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Card View - 2 Columns */}
          <div className="md:hidden grid grid-cols-2 gap-2.5">
            {filteredCategories.map((category, index) => {
              const rowKey = [
                category.id,
                category.slug,
                category.name,
                String(index),
              ]
                .filter(Boolean)
                .join("-");
              const isExpanded = expandedRow === category.id;

              return (
                <Card
                  key={rowKey}
                  className={cn(
                    "border-border/70 shadow-sm transition-all duration-200",
                    isExpanded && "border-primary/30 shadow-md",
                  )}
                >
                  <CardContent className="p-2.5">
                    <div
                      className="flex flex-col gap-1.5 cursor-pointer"
                      onClick={() => toggleRow(category.id)}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground truncate">
                            {category.name}
                          </p>
                          <p className="text-[9px] text-muted-foreground truncate">
                            /{category.slug}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1.5 py-0 h-4 shrink-0"
                        >
                          {category.productCount}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary"
                            aria-label={`Edit ${category.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(category);
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Delete ${category.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(category);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(category.id);
                          }}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expandable Description */}
                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t border-border/50 animate-in slide-in-from-top-1 duration-200">
                        <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-3">
                          {category.description || "No description"}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[8px] text-muted-foreground">
                            /{category.slug}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
