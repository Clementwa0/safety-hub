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
      className="
        invoice-document
        mx-auto
        max-w-4xl
        rounded-2xl
        border
        border-border
        bg-white
        p-6
        shadow-sm
        sm:p-10
        print:mx-0
        print:max-w-none
        print:rounded-none
        print:border-0
        print:p-0
        print:shadow-none
      "
    >
      {/* HEADER */}
      <header
        className="
          flex
          flex-col
          gap-6
          border-b
          border-border
          pb-6
          sm:flex-row
          sm:items-start
          sm:justify-between
          print:flex-row
          print:items-start
          print:justify-between
          print:gap-8
          print:pb-5
        "
      >
        {/* Document information */}
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {documentType}
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-foreground print:text-2xl">
            {documentNumber}
          </h2>

          {status ? (
            <p className="mt-1 text-sm capitalize text-muted-foreground">
              Status: {formattedStatus}
            </p>
          ) : null}
        </div>

        {/* Company information */}
        <div className="text-sm sm:text-right">
          <p className="text-base font-bold text-foreground">
            {settings.companyName}
          </p>

          {settings.address ? (
            <p className="mt-1 text-muted-foreground">
              {settings.address}
            </p>
          ) : null}

          {settings.contactEmail ? (
            <p className="text-muted-foreground">
              {settings.contactEmail}
            </p>
          ) : null}

          {settings.contactPhone ? (
            <p className="text-muted-foreground">
              {settings.contactPhone}
            </p>
          ) : null}
        </div>
      </header>

      {/* BILL TO + DATES */}
      <section
        className="
          grid
          gap-6
          border-b
          border-border
          py-6
          sm:grid-cols-2
          print:grid-cols-2
          print:gap-10
          print:py-5
        "
      >
        {/* Customer */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Bill to
          </p>

          <p className="mt-2 text-sm font-semibold text-foreground">
            {customerName || "—"}
          </p>

          {customerCompany ? (
            <p className="text-sm text-muted-foreground">
              {customerCompany}
            </p>
          ) : null}

          {customerEmail ? (
            <p className="text-sm text-muted-foreground">
              {customerEmail}
            </p>
          ) : null}

          {customerPhone ? (
            <p className="text-sm text-muted-foreground">
              {customerPhone}
            </p>
          ) : null}

          {customerAddress ? (
            <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
              {customerAddress}
            </p>
          ) : null}
        </div>

        {/* Dates */}
        <dl
          className="
            grid
            grid-cols-2
            gap-x-6
            gap-y-2
            text-sm
            sm:justify-self-end
            print:min-w-[250px]
            print:justify-self-end
          "
        >
          {issueDate ? (
            <>
              <dt className="text-muted-foreground">
                Issue date
              </dt>

              <dd className="whitespace-nowrap text-right font-medium">
                {formatDate(issueDate)}
              </dd>
            </>
          ) : null}

          {dueDate ? (
            <>
              <dt className="text-muted-foreground">
                Due date
              </dt>

              <dd className="whitespace-nowrap text-right font-medium">
                {formatDate(dueDate)}
              </dd>
            </>
          ) : null}

          {validUntil ? (
            <>
              <dt className="text-muted-foreground">
                Valid until
              </dt>

              <dd className="whitespace-nowrap text-right font-medium">
                {formatDate(validUntil)}
              </dd>
            </>
          ) : null}

          {status ? (
            <>
              <dt className="text-muted-foreground">
                Status
              </dt>

              <dd className="text-right font-medium capitalize">
                {formattedStatus}
              </dd>
            </>
          ) : null}
        </dl>
      </section>

      {/* MOBILE ITEMS */}
      <div className="divide-y divide-border py-2 sm:hidden print:hidden">
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No items on this document.
          </p>
        ) : (
          items.map((item, index) => (
            <div
              key={`${item.id ?? "item"}-${index}`}
              className="space-y-1.5 py-3 text-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {item.name || "Untitled item"}
                  </p>

                  {item.description ? (
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  ) : null}
                </div>

                <p className="shrink-0 font-medium tabular-nums">
                  {formatKES(lineItemTotal(item))}
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                {item.quantity} × {formatKES(item.unitPrice)}
                {item.discount
                  ? ` · ${item.discount}% disc.`
                  : ""}
                {item.taxRate
                  ? ` · ${item.taxRate}% tax`
                  : ""}
              </p>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP + PRINT TABLE */}
      <div
        className="
          hidden
          py-6
          sm:block
          print:block
          print:py-5
        "
      >
        <table
          className="
            w-full
            table-fixed
            border-collapse
            text-sm
          "
        >
          <colgroup>
            <col className="w-[40%]" />
            <col className="w-[9%]" />
            <col className="w-[18%]" />
            <col className="w-[10%]" />
            <col className="w-[9%]" />
            <col className="w-[14%]" />
          </colgroup>

          <thead>
            <tr className="border-b-2 border-border">
              <th
                scope="col"
                className="
                  py-3
                  pr-3
                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-muted-foreground
                "
              >
                Item
              </th>

              <th
                scope="col"
                className="
                  whitespace-nowrap
                  px-2
                  py-3
                  text-right
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-muted-foreground
                "
              >
                Qty
              </th>

              <th
                scope="col"
                className="
                  whitespace-nowrap
                  px-2
                  py-3
                  text-right
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-muted-foreground
                "
              >
                Unit price
              </th>

              <th
                scope="col"
                className="
                  whitespace-nowrap
                  px-2
                  py-3
                  text-right
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-muted-foreground
                "
              >
                Disc %
              </th>

              <th
                scope="col"
                className="
                  whitespace-nowrap
                  px-2
                  py-3
                  text-right
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-muted-foreground
                "
              >
                Tax %
              </th>

              <th
                scope="col"
                className="
                  whitespace-nowrap
                  py-3
                  pl-2
                  text-right
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-muted-foreground
                "
              >
                Total
              </th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground"
                >
                  No items on this document.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr
                  key={`${item.id ?? "item"}-${index}`}
                  className="
                    border-b
                    border-border/60
                    align-top
                    print:break-inside-avoid
                  "
                >
                  <td className="py-3 pr-3">
                    <p className="break-words font-medium text-foreground">
                      {item.name || "Untitled item"}
                    </p>

                    {item.description ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </td>

                  <td className="whitespace-nowrap px-2 py-3 text-right tabular-nums">
                    {item.quantity}
                  </td>

                  <td className="whitespace-nowrap px-2 py-3 text-right tabular-nums">
                    {formatKES(item.unitPrice)}
                  </td>

                  <td className="whitespace-nowrap px-2 py-3 text-right tabular-nums">
                    {item.discount}%
                  </td>

                  <td className="whitespace-nowrap px-2 py-3 text-right tabular-nums">
                    {item.taxRate}%
                  </td>

                  <td className="whitespace-nowrap py-3 pl-2 text-right font-medium tabular-nums">
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
          items-stretch
          gap-6
          border-t
          border-border
          pt-6
          sm:flex-row
          sm:justify-between
          print:flex-row
          print:items-start
          print:gap-10
          print:pt-5
        "
      >
        {/* Notes / Terms / Footer */}
        <div
          className="
            min-w-0
            flex-1
            space-y-4
            text-sm
            print:max-w-[55%]
          "
        >
          {notes ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Notes
              </p>

              <p className="mt-1 whitespace-pre-line text-muted-foreground">
                {notes}
              </p>
            </div>
          ) : null}

          {terms ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Terms
              </p>

              <p className="mt-1 whitespace-pre-line text-muted-foreground">
                {terms}
              </p>
            </div>
          ) : null}

          {footer ? (
            <div className="pt-1">
              {footer}
            </div>
          ) : null}
        </div>

        {/* Totals */}
        <dl
          className="
            grid
            w-full
            grid-cols-2
            gap-x-8
            gap-y-2
            text-sm
            sm:w-72
            sm:justify-self-end
            print:w-[280px]
            print:shrink-0
            print:justify-self-end
          "
        >
          <dt className="text-muted-foreground">
            Subtotal
          </dt>

          <dd className="whitespace-nowrap text-right font-medium tabular-nums">
            {formatKES(totals.subtotal)}
          </dd>

          <dt className="text-muted-foreground">
            Discount
          </dt>

          <dd className="whitespace-nowrap text-right font-medium tabular-nums">
            - {formatKES(totals.discount)}
          </dd>

          <dt className="text-muted-foreground">
            Tax
          </dt>

          <dd className="whitespace-nowrap text-right font-medium tabular-nums">
            {formatKES(totals.tax)}
          </dd>

          <dt
            className="
              col-span-2
              mt-2
              border-t
              border-border
              pt-3
              text-right
              text-xs
              uppercase
              tracking-wide
              text-muted-foreground
            "
          >
            Total due
          </dt>

          <dt className="text-base font-semibold text-foreground">
            Total
          </dt>

          <dd className="whitespace-nowrap text-right text-base font-semibold text-foreground tabular-nums">
            {formatKES(totals.total)}
          </dd>
        </dl>
      </section>
    </div>
  );
}

export default DocumentPreview;