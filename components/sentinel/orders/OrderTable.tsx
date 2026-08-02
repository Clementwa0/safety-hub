"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/sentinel/sales/StatusBadge";
import { formatDate, formatKES } from "@/lib/format";
import { computeTotals } from "@/lib/sales";
import type { Order } from "@/types/order";

interface OrderTableProps {
  orders: Order[];
  onDelete?: (order: Order) => void;
  compact?: boolean;
}

export default function OrderTable({ orders, onDelete, compact }: OrderTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
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
                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
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
                        size="icon-sm"
                        aria-label={`View order ${order.number}`}
                        nativeButton={false}
                        render={<Link href={`/sentinel/orders/${order.id}`} />}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit order ${order.number}`}
                        nativeButton={false}
                        render={<Link href={`/sentinel/orders/${order.id}/edit`} />}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
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
  );
}
