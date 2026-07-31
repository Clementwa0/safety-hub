"use client";

import type { ReactNode } from "react";

import { formatDate, formatKES } from "@/lib/format";
import { computeTotals, lineItemTotal } from "@/lib/sales";
import type { Customer, LineItem } from "@/types/sales";

interface DocumentPreviewProps {
  documentType: string;
  documentNumber: string;
  issueDate?: number;
  dueDate?: number;
  validUntil?: number;
  status?: string;
  customer: Customer;
  items: LineItem[];
  notes?: string;
  terms?: string;
  footer?: ReactNode;
}

export function DocumentPreview({
  documentType,
  documentNumber,
  issueDate,
  dueDate,
  validUntil,
  status,
  customer,
  items,
  notes,
  terms,
  footer,
}: DocumentPreviewProps) {
  const totals = computeTotals(items);

  return (
    <div
      id="document-print-area"
      className="mx-auto max-w-4xl rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-10"
    >
      <div className="flex flex-col gap-6 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {documentType}
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-foreground">
            {documentNumber}
          </h2>
          {status ? (
            <p className="mt-1 text-sm text-muted-foreground capitalize">
              Status: {status.replace(/_/g, " ")}
            </p>
          ) : null}
        </div>

        <div className="text-sm sm:text-right">
          <p className="text-base font-semibold text-foreground">Safety Hub</p>
          <p className="text-muted-foreground">Nairobi, Kenya</p>
          <p className="text-muted-foreground">sales@safetyhub.co.ke</p>
        </div>
      </div>

      <div className="grid gap-6 border-b border-border py-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Bill to
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {customer.name || "—"}
          </p>
          {customer.company ? (
            <p className="text-sm text-muted-foreground">{customer.company}</p>
          ) : null}
          {customer.email ? (
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          ) : null}
          {customer.phone ? (
            <p className="text-sm text-muted-foreground">{customer.phone}</p>
          ) : null}
          {customer.address ? (
            <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
              {customer.address}
            </p>
          ) : null}
        </div>

        <dl className="grid grid-cols-2 gap-y-2 text-sm sm:justify-self-end">
          {issueDate ? (
            <>
              <dt className="text-muted-foreground">Issue date</dt>
              <dd className="text-right font-medium">{formatDate(issueDate)}</dd>
            </>
          ) : null}
          {dueDate ? (
            <>
              <dt className="text-muted-foreground">Due date</dt>
              <dd className="text-right font-medium">{formatDate(dueDate)}</dd>
            </>
          ) : null}
          {validUntil ? (
            <>
              <dt className="text-muted-foreground">Valid until</dt>
              <dd className="text-right font-medium">{formatDate(validUntil)}</dd>
            </>
          ) : null}
        </dl>
      </div>

      <div className="overflow-x-auto py-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-2">Item</th>
              <th className="py-2 px-2 text-right">Qty</th>
              <th className="py-2 px-2 text-right">Unit price</th>
              <th className="py-2 px-2 text-right">Disc %</th>
              <th className="py-2 px-2 text-right">Tax %</th>
              <th className="py-2 pl-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-muted-foreground">
                  No items on this document.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-border/60 align-top">
                  <td className="py-3 pr-2">
                    <p className="font-medium text-foreground">
                      {item.name || "Untitled item"}
                    </p>
                    {item.description ? (
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </td>
                  <td className="py-3 px-2 text-right">{item.quantity}</td>
                  <td className="py-3 px-2 text-right">{formatKES(item.unitPrice)}</td>
                  <td className="py-3 px-2 text-right">{item.discount}%</td>
                  <td className="py-3 px-2 text-right">{item.taxRate}%</td>
                  <td className="py-3 pl-2 text-right font-medium">
                    {formatKES(lineItemTotal(item))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col-reverse items-stretch gap-6 border-t border-border pt-6 sm:flex-row sm:justify-between">
        <div className="flex-1 space-y-4 text-sm">
          {notes ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Notes
              </p>
              <p className="whitespace-pre-line text-muted-foreground">{notes}</p>
            </div>
          ) : null}
          {terms ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Terms
              </p>
              <p className="whitespace-pre-line text-muted-foreground">{terms}</p>
            </div>
          ) : null}
          {footer}
        </div>

        <dl className="grid w-full grid-cols-2 gap-y-2 text-sm sm:w-72 sm:justify-self-end">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="text-right font-medium">{formatKES(totals.subtotal)}</dd>
          <dt className="text-muted-foreground">Discount</dt>
          <dd className="text-right font-medium">- {formatKES(totals.discount)}</dd>
          <dt className="text-muted-foreground">Tax</dt>
          <dd className="text-right font-medium">{formatKES(totals.tax)}</dd>
          <dt className="col-span-2 mt-2 border-t border-border pt-2 text-right text-xs uppercase tracking-wide text-muted-foreground">
            Total due
          </dt>
          <dt className="text-base font-semibold text-foreground">Total</dt>
          <dd className="text-right text-base font-semibold text-foreground">
            {formatKES(totals.total)}
          </dd>
        </dl>
      </div>
    </div>
  );
}

export default DocumentPreview;
