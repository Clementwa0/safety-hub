"use client";

import Link from "next/link";
import { Copy, Eye, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuotationStatusBadge } from "@/components/sentinel/sales/StatusBadge";
import { FulfillmentBadge } from "@/components/sentinel/sales/FulfillmentBadge";
import { formatKES, formatDate } from "@/lib/format";
import { computeDocumentTotals } from "@/lib/sales";

import type { Quotation } from "@/types/sentinel/quotation";

type Props = {
  quotations: Quotation[];
  onDelete: (q: Quotation) => void;
  onDuplicate: (q: Quotation) => void;
};

function overallFulfillment(q: Quotation): string | undefined {
  const plans = q.items.map((item) => item.fulfillmentPlan).filter(Boolean);
  if (plans.length === 0) return undefined;
  if (plans.includes("procurement")) return "procurement";
  if (plans.includes("partial")) return "partial";
  return "available";
}

export default function QuotationTable({ quotations, onDelete, onDuplicate }: Props) {
  return (
    <>
      {/* Mobile card view */}
      <div className="sm:hidden space-y-2 p-1.5">
        {quotations.map((q) => {
          const totals = computeDocumentTotals(q.items);
          const fulfillment = overallFulfillment(q);
          const customerName = q.customer?.name ?? "Deleted customer";
          const customerCompany = q.customer?.company;

          return (
            <div key={q.id} className="rounded-md border border-border/40 bg-background p-2 shadow-sm">
              <div className="flex items-start justify-between gap-1.5">
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">{q.number}</span>
                    <QuotationStatusBadge status={q.status}  />
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {customerName}{customerCompany ? ` · ${customerCompany}` : ""}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span>{formatDate(q.issueDate)}</span>
                    {fulfillment && (
                      <>
                        <span>·</span>
                        <FulfillmentBadge plan={fulfillment} />
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-medium tabular-nums">{formatKES(totals.total)}</div>
                  <div className="mt-0.5 flex items-center justify-end gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      nativeButton={false}
                      render={<Link href={`/sentinel/quotations/${q.id}`} />}
                      aria-label="View"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      nativeButton={false}
                      render={<Link href={`/sentinel/quotations/${q.id}/edit`} />}
                      aria-label="Edit"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onDuplicate(q)}
                      aria-label="Duplicate"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onDelete(q)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {quotations.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">No quotations to display</p>
        )}
      </div>

      {/* Desktop/tablet table view */}
      <div className="hidden sm:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="h-8 px-2 text-xs font-medium text-muted-foreground sm:text-xs">
                Number
              </TableHead>
              <TableHead className="h-8 px-2 text-xs font-medium text-muted-foreground sm:text-xs">
                Customer
              </TableHead>
              <TableHead className="hidden md:table-cell h-8 px-2 text-xs font-medium text-muted-foreground sm:text-xs">
                Issued
              </TableHead>
              <TableHead className="h-8 px-2 text-xs font-medium text-muted-foreground sm:text-xs">
                Status
              </TableHead>
              <TableHead className="hidden lg:table-cell h-8 px-2 text-xs font-medium text-muted-foreground sm:text-xs">
                Availability
              </TableHead>
              <TableHead className="h-8 px-2 text-right text-xs font-medium text-muted-foreground sm:text-xs">
                Total
              </TableHead>
              <TableHead className="h-8 px-2 text-right text-xs font-medium text-muted-foreground sm:text-xs">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {quotations.map((q) => {
              const totals = computeDocumentTotals(q.items);
              const fulfillment = overallFulfillment(q);
              const customerName = q.customer?.name ?? "Deleted customer";
              const customerCompany = q.customer?.company;

              return (
                <TableRow key={q.id} className="border-border/30 hover:bg-muted/40">
                  <TableCell className="px-2 py-1.5 text-xs font-medium sm:text-xs">{q.number}</TableCell>
                  <TableCell className="px-2 py-1.5">
                    <div className="text-xs">{customerName}</div>
                    {customerCompany && (
                      <div className="text-[10px] text-muted-foreground">{customerCompany}</div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell px-2 py-1.5 text-xs">
                    {formatDate(q.issueDate)}
                  </TableCell>
                  <TableCell className="px-2 py-1.5">
                    <QuotationStatusBadge status={q.status} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell px-2 py-1.5">
                    {fulfillment ? (
                      <FulfillmentBadge plan={fulfillment}  />
                    ) : (
                      <span className="text-[10px] text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="px-2 py-1.5 text-right text-xs font-medium tabular-nums">
                    {formatKES(totals.total)}
                  </TableCell>
                  <TableCell className="px-2 py-1.5 text-right">
                    <div className="flex justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 sm:h-7 sm:w-7"
                        nativeButton={false}
                        render={<Link href={`/sentinel/quotations/${q.id}`} />}
                        aria-label="View"
                      >
                        <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 sm:h-7 sm:w-7"
                        nativeButton={false}
                        render={<Link href={`/sentinel/quotations/${q.id}/edit`} />}
                        aria-label="Edit"
                      >
                        <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 sm:h-7 sm:w-7"
                        onClick={() => onDuplicate(q)}
                        aria-label="Duplicate"
                      >
                        <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 sm:h-7 sm:w-7"
                        onClick={() => onDelete(q)}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3 w-3 text-destructive sm:h-3.5 sm:w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {quotations.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                  No quotations to display
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}