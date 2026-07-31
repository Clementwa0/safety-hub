"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CategoryWithCount } from "@/types/category";

interface CategoryTableProps {
  categories: CategoryWithCount[];
  onEdit: (category: CategoryWithCount) => void;
  onDelete: (category: CategoryWithCount) => void;
}

export default function CategoryTable({
  categories,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[180px]">Category</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead>Products</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {categories.map((category, index) => {
            const rowKey = [category.id, category.slug, category.name, String(index)]
              .filter(Boolean)
              .join("-");

            return (
              <TableRow key={rowKey}>
              <TableCell>
                <p className="text-sm font-medium text-foreground">
                  {category.name}
                </p>
                <p className="text-xs text-muted-foreground">/{category.slug}</p>
              </TableCell>

              <TableCell className="hidden max-w-md md:table-cell">
                <p className="truncate text-sm text-muted-foreground">
                  {category.description}
                </p>
              </TableCell>

              <TableCell>
                <Badge variant="outline">{category.productCount}</Badge>
              </TableCell>

              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${category.name}`}
                    onClick={() => onEdit(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${category.name}`}
                    onClick={() => onDelete(category)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
