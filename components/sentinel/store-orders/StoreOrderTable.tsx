"use client";

import Link from "next/link";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StoreOrderStatusBadge, StorePaymentStatusBadge } from "@/components/checkout/StoreOrderStatusBadge";
import { formatDate, formatKES } from "@/lib/format";
import type { StoreOrder } from "@/types/storefront/store-order";

interface StoreOrderTableProps {
  orders: StoreOrder[];
}

export default function StoreOrderTable({ orders }: StoreOrderTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="text-sm font-medium">{order.orderNumber}</TableCell>
              <TableCell>
                <p className="text-sm font-medium">{order.customer.name}</p>
                <p className="text-xs text-muted-foreground">{order.customer.email}</p>
              </TableCell>
              <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                {formatDate(new Date(order.createdAt))}
              </TableCell>
              <TableCell className="text-sm font-medium">{formatKES(order.total)}</TableCell>
              <TableCell>
                <StorePaymentStatusBadge status={order.paymentStatus} />
              </TableCell>
              <TableCell>
                <StoreOrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`View order ${order.orderNumber}`}
                    nativeButton={false}
                    render={<Link href={`/sentinel/store-orders/${order.id}`} />}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
