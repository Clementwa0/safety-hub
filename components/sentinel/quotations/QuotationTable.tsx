"use client";
import Link from "next/link";
import { Copy, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QuotationStatusBadge } from "@/components/sentinel/sales/StatusBadge";
import { formatKES, formatDate } from "@/lib/format";
import { computeDocumentTotals } from "@/lib/sales";
import type { Quotation } from "@/types/quotation";

type Props = { quotations: Quotation[]; onDelete: (q: Quotation) => void; onDuplicate: (q: Quotation) => void };

export default function QuotationTable({ quotations, onDelete, onDuplicate }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Number</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Issued</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="w-[1%] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quotations.map((q) => {
          const totals = computeDocumentTotals(q.items);
          return (
            <TableRow key={q.id}>
              <TableCell className="font-medium">{q.number}</TableCell>
              <TableCell>
                <div>{q.customer.name}</div>
                {q.customer.company ? <div className="text-xs text-muted-foreground">{q.customer.company}</div> : null}
              </TableCell>
              <TableCell>{formatDate(q.issueDate)}</TableCell>
              <TableCell><QuotationStatusBadge status={q.status} /></TableCell>
              <TableCell className="text-right">{formatKES(totals.total)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" nativeButton={false} render={<Link href={`/sentinel/quotations/${q.id}`} />} aria-label="View">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" nativeButton={false} render={<Link href={`/sentinel/quotations/${q.id}/edit`} />} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDuplicate(q)} aria-label="Duplicate">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(q)} aria-label="Delete">
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
