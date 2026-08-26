"use client";

import Link from "next/link";
import { ChevronRight, Eye, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  StoreOrderStatusBadge,
  StorePaymentStatusBadge,
} from "@/features/storefront/checkout/components/StoreOrderStatusBadge";
import { formatDate, formatKES } from "@/lib/format";
import type { StoreOrder } from "@/types/storefront/store-order";

interface StoreOrderTableProps {
  orders: StoreOrder[];
}

const orderHref = (orderId: string) =>
  `/sentinel/store-orders/${orderId}`;

export default function StoreOrderTable({
  orders,
}: StoreOrderTableProps) {
  if (orders.length === 0) {
    return (
      <Card className="border-dashed bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-background shadow-sm ring-1 ring-border">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">
              No orders yet
            </p>

            <p className="text-xs text-muted-foreground">
              Orders will appear here once customers make purchases.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop */}
      <Card className="hidden overflow-hidden border-none shadow-none md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Order
                </TableHead>

                <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Customer
                </TableHead>

                <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Date
                </TableHead>

                <TableHead className="h-9 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Total
                </TableHead>

                <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Payment
                </TableHead>

                <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </TableHead>

                <TableHead className="h-9 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="group transition-colors hover:bg-muted/30"
                >
                  <TableCell className="py-2.5 font-mono text-xs font-semibold text-primary">
                    {order.orderNumber}
                  </TableCell>

                  <TableCell className="py-2.5">
                    <div className="flex min-w-0 flex-col leading-tight">
                      <span className="truncate text-sm font-medium text-foreground">
                        {order.customer.name}
                      </span>

                      <span className="truncate text-xs text-muted-foreground">
                        {order.customer.email}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="whitespace-nowrap py-2.5 text-xs text-muted-foreground">
                    {formatDate(new Date(order.createdAt))}
                  </TableCell>

                  <TableCell className="py-2.5 text-right text-sm font-semibold tabular-nums text-foreground">
                    {formatKES(order.total)}
                  </TableCell>

                  <TableCell className="py-2.5">
                    <StorePaymentStatusBadge
                      status={order.paymentStatus}
                    />
                  </TableCell>

                  <TableCell className="py-2.5">
                    <StoreOrderStatusBadge status={order.status} />
                  </TableCell>

                  <TableCell className="py-2.5 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 opacity-70 transition-opacity group-hover:opacity-100"
                    >
                      <Link href={orderHref(order.id)}>
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Mobile */}
      <ul className="space-y-3 md:hidden">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={orderHref(order.id)}
              className="block"
            >
              <Card className="group p-4 transition-colors hover:bg-accent/50">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">
                        {order.orderNumber}
                      </span>

                      <StoreOrderStatusBadge
                        status={order.status}
                      />

                      <StorePaymentStatusBadge
                        status={order.paymentStatus}
                      />
                    </div>

                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {order.customer.name} ·{" "}
                      {formatDate(new Date(order.createdAt))}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-semibold sm:text-base">
                      {formatKES(order.total)}
                    </span>

                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}