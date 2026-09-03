"use client";

import type { ReactNode } from "react";

import { formatDate, formatKES } from "@/lib/format";
import { computeTotals, lineItemTotal } from "@/lib/sales";
import { useSettings } from "@/components/SettingsProvider";
import type { Customer, LineItem } from "@/types/sentinel/sales";

interface DocumentPreviewProps {
  documentType: string;
  documentNumber: string;
  issueDate?: number;
  dueDate?: number;
  validUntil?: number;
  status?: string;
  customer: Customer | null;
  items: LineItem[];
  notes?: string;
  terms?: string;
  footer?: ReactNode;
  className?: string;
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
  className = "",
}: DocumentPreviewProps) {
  const totals = computeTotals(items);
  const { settings } = useSettings();
  const customerName = customer?.name ?? "Deleted customer";
  const customerCompany = customer?.company;
  const customerEmail = customer?.email;
  const customerPhone = customer?.phone;
  const customerAddress = customer?.address;

  const formattedStatus = status
    ? status.replace(/_/g, " ")
    : "";

  return (
    <div
      id="document-print-area"
      className={`
        invoice-document
        mx-auto
        max-w-4xl
        rounded-xl
        border
        border-border/40
        bg-background
        p-3
        shadow-sm
        sm:p-4
        md:p-6
        print:mx-0
        print:max-w-none
        print:rounded-none
        print:border-0
        print:p-0
        print:shadow-none
        ${className}
      `}
    >
      {/* HEADER */}
      <header
        className="
          flex
          flex-col
          gap-3
          border-b
          border-border/40
          pb-3
          sm:flex-row
          sm:items-start
          sm:justify-between
          sm:pb-4
          print:flex-row
          print:items-start
          print:justify-between
          print:gap-6
          print:pb-4
        "
      >
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-xs">
            {documentType}
          </p>
          <h2 className="mt-0.5 text-lg font-semibold text-foreground sm:text-xl md:text-2xl print:text-2xl">
            {documentNumber}
          </h2>
          {status && (
            <p className="mt-0.5 text-xs capitalize text-muted-foreground sm:text-sm">
              Status: {formattedStatus}
            </p>
          )}
        </div>

        <div className="text-sm sm:text-right">
          <p className="text-sm font-bold text-foreground sm:text-base">
            {settings.companyName}
          </p>
          {settings.address && (
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              {settings.address}
            </p>
          )}
          {settings.contactEmail && (
            <p className="text-xs text-muted-foreground sm:text-sm">
              {settings.contactEmail}
            </p>
          )}
          {settings.contactPhone && (
            <p className="text-xs text-muted-foreground sm:text-sm">
              {settings.contactPhone}
            </p>
          )}
        </div>
      </header>

      {/* BILL TO + DATES */}
      <section
        className="
          grid
          gap-3
          border-b
          border-border/40
          py-3
          sm:grid-cols-2
          sm:gap-4
          sm:py-4
          print:grid-cols-2
          print:gap-6
          print:py-4
        "
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-xs">
            Bill to
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground sm:text-base">
            {customerName || "-"}
          </p>
          {customerCompany && (
            <p className="text-xs text-muted-foreground sm:text-sm">
              {customerCompany}
            </p>
          )}
          {customerEmail && (
            <p className="text-xs text-muted-foreground sm:text-sm">
              {customerEmail}
            </p>
          )}
          {customerPhone && (
            <p className="text-xs text-muted-foreground sm:text-sm">
              {customerPhone}
            </p>
          )}
          {customerAddress && (
            <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground sm:text-sm">
              {customerAddress}
            </p>
          )}
        </div>

        <dl
          className="
            grid
            grid-cols-2
            gap-x-4
            gap-y-1
            text-xs
            sm:justify-self-end
            sm:text-sm
            print:min-w-[200px]
            print:justify-self-end
          "
        >
          {issueDate && (
            <>
              <dt className="text-muted-foreground">Issue date</dt>
              <dd className="whitespace-nowrap text-right font-medium">
                {formatDate(issueDate)}
              </dd>
            </>
          )}
          {dueDate && (
            <>
              <dt className="text-muted-foreground">Due date</dt>
              <dd className="whitespace-nowrap text-right font-medium">
                {formatDate(dueDate)}
              </dd>
            </>
          )}
          {validUntil && (
            <>
              <dt className="text-muted-foreground">Valid until</dt>
              <dd className="whitespace-nowrap text-right font-medium">
                {formatDate(validUntil)}
              </dd>
            </>
          )}
          {status && (
            <>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="whitespace-nowrap text-right font-medium capitalize">
                {formattedStatus}
              </dd>
            </>
          )}
        </dl>
      </section>

      {/* MOBILE ITEMS */}
      <div className="divide-y divide-border/40 py-2 sm:hidden print:hidden">
        {items.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No items on this document.
          </p>
        ) : (
          items.map((item, index) => (
            <div
              key={`${item.id ?? "item"}-${index}`}
              className="space-y-1 py-2 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {item.name || "Untitled item"}
                  </p>
                  {item.description && (
                    <p className="text-[10px] text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>
                <p className="shrink-0 font-medium tabular-nums">
                  {formatKES(lineItemTotal(item))}
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {item.quantity} × {formatKES(item.unitPrice)}
                {item.discount ? ` · ${item.discount}% disc.` : ""}
                {item.taxRate ? ` · ${item.taxRate}% tax` : ""}
              </p>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP + PRINT TABLE */}
      <div className="hidden py-2 sm:block print:block print:py-3">
        <table className="w-full table-fixed border-collapse text-xs sm:text-sm">
          <colgroup>
            <col className="w-[35%]" />
            <col className="w-[8%]" />
            <col className="w-[16%]" />
            <col className="w-[10%]" />
            <col className="w-[8%]" />
            <col className="w-[13%]" />
          </colgroup>

          <thead>
            <tr className="border-b-2 border-border/40">
              <th scope="col" className="py-2 pr-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
                Item
              </th>
              <th scope="col" className="whitespace-nowrap px-1 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:px-2 sm:text-xs">
                Qty
              </th>
              <th scope="col" className="whitespace-nowrap px-1 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:px-2 sm:text-xs">
                Unit
              </th>
              <th scope="col" className="whitespace-nowrap px-1 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:px-2 sm:text-xs">
                Disc %
              </th>
              <th scope="col" className="whitespace-nowrap px-1 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:px-2 sm:text-xs">
                Tax %
              </th>
              <th scope="col" className="whitespace-nowrap py-2 pl-1 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:pl-2 sm:text-xs">
                Total
              </th>
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
              items.map((item, index) => (
                <tr
                  key={`${item.id ?? "item"}-${index}`}
                  className="border-b border-border/30 align-top print:break-inside-avoid"
                >
                  <td className="py-2 pr-2">
                    <p className="break-words font-medium text-foreground">
                      {item.name || "Untitled item"}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
                        {item.description}
                      </p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-1 py-2 text-right tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="whitespace-nowrap px-1 py-2 text-right tabular-nums">
                    {formatKES(item.unitPrice)}
                  </td>
                  <td className="whitespace-nowrap px-1 py-2 text-right tabular-nums">
                    {item.discount}%
                  </td>
                  <td className="whitespace-nowrap px-1 py-2 text-right tabular-nums">
                    {item.taxRate}%
                  </td>
                  <td className="whitespace-nowrap py-2 pl-1 text-right font-medium tabular-nums">
                    {formatKES(lineItemTotal(item))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* NOTES + TOTALS */}
      <section
        className="
          flex
          flex-col-reverse
          gap-3
          border-t
          border-border/40
          pt-3
          sm:flex-row
          sm:justify-between
          sm:pt-4
          print:flex-row
          print:items-start
          print:gap-6
          print:pt-4
        "
      >
        <div className="min-w-0 flex-1 space-y-3 text-xs sm:text-sm print:max-w-[55%]">
          {notes && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-xs">
                Notes
              </p>
              <p className="mt-0.5 whitespace-pre-line text-muted-foreground">
                {notes}
              </p>
            </div>
          )}
          {terms && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-xs">
                Terms
              </p>
              <p className="mt-0.5 whitespace-pre-line text-muted-foreground">
                {terms}
              </p>
            </div>
          )}
          {footer && <div className="pt-1">{footer}</div>}
        </div>

        <dl className="grid w-full grid-cols-2 gap-x-4 gap-y-0.5 text-xs sm:w-64 sm:text-sm print:w-[220px] print:shrink-0">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="whitespace-nowrap text-right font-medium tabular-nums">
            {formatKES(totals.subtotal)}
          </dd>
          <dt className="text-muted-foreground">Discount</dt>
          <dd className="whitespace-nowrap text-right font-medium tabular-nums">
            - {formatKES(totals.discount)}
          </dd>
          <dt className="text-muted-foreground">Tax</dt>
          <dd className="whitespace-nowrap text-right font-medium tabular-nums">
            {formatKES(totals.tax)}
          </dd>
          <dt className="col-span-2 mt-1 border-t border-border/40 pt-2 text-right text-[10px] uppercase tracking-wide text-muted-foreground sm:text-xs">
            Total due
          </dt>
          <dt className="text-sm font-semibold text-foreground sm:text-base">Total</dt>
          <dd className="whitespace-nowrap text-right text-sm font-semibold text-foreground tabular-nums sm:text-base">
            {formatKES(totals.total)}
          </dd>
        </dl>
      </section>
    </div>
  );
}

export default DocumentPreview;