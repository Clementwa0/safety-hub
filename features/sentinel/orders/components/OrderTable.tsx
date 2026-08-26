"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatKES } from "@/lib/format";
import { computeTotals } from "@/lib/sales";
import type { Order } from "@/types/sentinel/order";
import { OrderStatusBadge } from "@/components/sentinel/sales/StatusBadge";

interface OrderTableProps {
  orders: Order[];
  onDelete?: (order: Order) => void;
  compact?: boolean;
}

export default function OrderTable({ orders, onDelete, compact }: OrderTableProps) {
  return (
    <>
      {/* Mobile / narrow-tablet: card list. Avoids squeezing a 5-6 column
          table into a small viewport and horizontal-scroll discovery. */}
      <ul className="divide-y divide-border md:hidden">
        {orders.map((order) => {
          const totals = computeTotals(order.items);
          return (
            <li key={order.id} className="relative">
              <Link
                href={`/sentinel/orders/${order.id}`}
                className="flex items-center gap-3 px-4 py-3 active:bg-muted/50"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{order.number}</span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {formatKES(totals.total)}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {order.customer.name}
                    {order.customer.company ? ` · ${order.customer.company}` : ""}
                  </p>
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <OrderStatusBadge status={order.status} />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
              </Link>

              {compact ? null : (
                <div className="flex items-center gap-1 px-4 pb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 flex-1 justify-center gap-1.5 text-xs"
                    aria-label={`Edit order ${order.number}`}
                    nativeButton={false}
                    render={<Link href={`/sentinel/orders/${order.id}/edit`} />}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 flex-1 justify-center gap-1.5 text-xs text-destructive hover:text-destructive"
                    aria-label={`Delete order ${order.number}`}
                    onClick={() => onDelete?.(order)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Desktop / tablet: standard table */}
      <div className="hidden w-full overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              {compact ? null : <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const totals = computeTotals(order.items);
              return (
                <TableRow key={order.id}>
                  <TableCell className="text-sm font-medium">{order.number}</TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{order.customer.name}</p>
                    {order.customer.company ? (
                      <p className="text-xs text-muted-foreground">
                        {order.customer.company}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {formatKES(totals.total)}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  {compact ? null : (
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`View order ${order.number}`}
                          nativeButton={false}
                          render={<Link href={`/sentinel/orders/${order.id}`} />}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit order ${order.number}`}
                          nativeButton={false}
                          render={<Link href={`/sentinel/orders/${order.id}/edit`} />}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete order ${order.number}`}
                          onClick={() => onDelete?.(order)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
