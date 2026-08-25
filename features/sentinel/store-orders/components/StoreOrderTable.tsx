"use client";

import Link from "next/link";
import { Calendar, ChevronRight, Eye, Package, User } from "lucide-react";

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

const orderHref = (orderId: string) => `/sentinel/store-orders/${orderId}`;

export default function StoreOrderTable({ orders }: StoreOrderTableProps) {
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
      <Card className="hidden overflow-hidden md:block border-none shadow-none ">
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
                    <StorePaymentStatusBadge status={order.paymentStatus} />
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

      {/* Mobile — individual cards, no wrapper background/border */}
      <div className="flex flex-col gap-2 md:hidden">
        {orders.map((order) => {
          const itemCount = order.items?.length ?? 0;

          return (
            <Card
              key={order.id}
              className="overflow-hidden shadow-sm transition-shadow active:shadow-none"
            >
              <CardContent className="p-3">
                <Link href={orderHref(order.id)} className="block">
                  {/* Order + Total */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate font-mono text-[13px] font-semibold text-primary">
                        {order.orderNumber}
                      </span>

                      <StoreOrderStatusBadge status={order.status} />
                    </div>

                    <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                      {formatKES(order.total)}
                    </span>
                  </div>

                  {/* Customer */}
                  <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
                    <User className="size-3 shrink-0 text-muted-foreground" />

                    <span className="truncate text-xs font-medium text-foreground">
                      {order.customer.name}
                    </span>

                    <span className="shrink-0 text-[10px] text-muted-foreground/50">
                      •
                    </span>

                    <span className="truncate text-[11px] text-muted-foreground">
                      {order.customer.email}
                    </span>
                  </div>

                  {/* Date + Items + Payment + View */}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Calendar className="size-3 shrink-0" />

                      <span className="truncate">
                        {formatDate(new Date(order.createdAt))}
                      </span>

                      <span className="shrink-0 text-muted-foreground/50">
                        •
                      </span>

                      <span className="shrink-0">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <StorePaymentStatusBadge status={order.paymentStatus} />

                      <span className="flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-1 text-[11px] font-semibold text-primary transition-colors group-hover:bg-primary/10">
                        View
                        <ChevronRight className="size-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
