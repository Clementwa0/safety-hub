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

import { InvoiceStatusBadge } from "@/components/sentinel/sales/StatusBadge";
import { formatKES, formatDate } from "@/lib/format";
import { computeDocumentTotals } from "@/lib/sales";
import { invoiceService } from "@/services/sentinel/invoice.service";
import type { Invoice } from "@/types/sentinel/invoice";

type Props = {
  invoices: Invoice[];
  onDelete: (inv: Invoice) => void;
};

export default function InvoiceTable({ invoices, onDelete }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Number</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Due</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Balance</TableHead>
          <TableHead className="w-[1%] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {invoices.map((inv) => {
          const totals = computeDocumentTotals(inv.items);
          const balance = invoiceService.outstandingBalance(inv);
          const effective = invoiceService.effectiveStatus(inv);

          return (
            <TableRow key={inv.id}>
              <TableCell className="font-medium">
                {inv.number}
              </TableCell>

              {/* Customer */}
              <TableCell>
                {inv.customer ? (
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {inv.customer.name}
                    </div>

                    {inv.customer.company ? (
                      <div className="truncate text-xs text-muted-foreground">
                        {inv.customer.company}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Walk-in customer
                  </span>
                )}
              </TableCell>

              {/* Due date */}
              <TableCell>
                {inv.dueDate ? formatDate(inv.dueDate) : "-"}
              </TableCell>

              {/* Status */}
              <TableCell>
                <InvoiceStatusBadge status={effective} />
              </TableCell>

              {/* Total */}
              <TableCell className="text-right">
                {formatKES(totals.total)}
              </TableCell>

              {/* Balance */}
              <TableCell className="text-right">
                {formatKES(balance)}
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    nativeButton={false}
                    render={
                      <Link href={`/sentinel/invoices/${inv.id}`} />
                    }
                    aria-label={`View invoice ${inv.number}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    nativeButton={false}
                    render={
                      <Link
                        href={`/sentinel/invoices/${inv.id}/edit`}
                      />
                    }
                    aria-label={`Edit invoice ${inv.number}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(inv)}
                    aria-label={`Delete invoice ${inv.number}`}
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
  );
}