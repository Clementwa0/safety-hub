import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

import { formatKES, formatDate } from "@/lib/format";
import { computeTotals, lineItemTotal } from "@/lib/sales";
import type { PortalSettings } from "@/services/sentinel/settings.service";
import type { NormalizedSalesDocument } from "@/types/sentinel/document-share";

const COLORS = {
  primary: "#0F2D52",
  foreground: "#1E293B",
  muted: "#64748B",
  border: "#E2E8F0",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontSize: 9,
    color: COLORS.foreground,
    fontFamily: "Helvetica",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  eyebrow: {
    fontSize: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLORS.muted,
  },
  documentNumber: {
    fontSize: 18,
    fontWeight: 700,
    color: COLORS.foreground,
    marginTop: 2,
  },
  statusLine: {
    fontSize: 9,
    color: COLORS.muted,
    marginTop: 2,
    textTransform: "capitalize",
  },
  companyBlock: {
    alignItems: "flex-end",
  },
  companyLogo: {
    width: 44,
    height: 44,
    marginBottom: 6,
    objectFit: "contain",
  },
  companyName: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.foreground,
  },
  companyLine: {
    fontSize: 9,
    color: COLORS.muted,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  billTo: {
    maxWidth: 260,
  },
  billToLabel: {
    fontSize: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLORS.muted,
    marginBottom: 3,
  },
  billToName: {
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.foreground,
  },
  billToLine: {
    fontSize: 9,
    color: COLORS.muted,
    marginTop: 1,
  },
  datesBlock: {
    alignItems: "flex-end",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 2,
  },
  dateLabel: {
    fontSize: 9,
    color: COLORS.muted,
    marginRight: 8,
  },
  dateValue: {
    fontSize: 9,
    fontWeight: 700,
    color: COLORS.foreground,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 4,
    marginBottom: 2,
  },
  th: {
    fontSize: 7.5,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: COLORS.muted,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 5,
  },
  td: {
    fontSize: 9,
    color: COLORS.foreground,
  },
  colItem: { width: "34%" },
  colQty: { width: "10%", textAlign: "right" },
  colUnit: { width: "18%", textAlign: "right" },
  colDisc: { width: "12%", textAlign: "right" },
  colTax: { width: "12%", textAlign: "right" },
  colTotal: { width: "14%", textAlign: "right", fontWeight: 700 },
  emptyRow: {
    paddingVertical: 16,
    textAlign: "center",
    color: COLORS.muted,
    fontSize: 9,
  },
  footerBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  notesBlock: {
    maxWidth: 280,
  },
  notesLabel: {
    fontSize: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLORS.muted,
    marginBottom: 3,
    marginTop: 10,
  },
  notesText: {
    fontSize: 9,
    color: COLORS.muted,
    lineHeight: 1.4,
  },
  totalsBlock: {
    width: 200,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  totalsLabel: {
    fontSize: 9,
    color: COLORS.muted,
  },
  totalsValue: {
    fontSize: 9,
    fontWeight: 700,
    color: COLORS.foreground,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.foreground,
  },
  grandTotalValue: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.primary,
  },
  paymentSummary: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  pageFooter: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: COLORS.muted,
  },
});

interface SalesDocumentPdfDocumentProps {
  doc: NormalizedSalesDocument;
  settings: PortalSettings;
  logoDataUri?: string;
}

/**
 * The single PDF layout for invoices, quotations, and sales orders. Every
 * document type is normalized into `NormalizedSalesDocument`
 * (modules/sales-documents/fetch.ts) before it reaches this component, so
 * this file never branches on `doc.type` for layout - only the optional
 * `paymentSummary` block (invoices only) is conditional.
 */
export function SalesDocumentPdfDocument({ doc, settings, logoDataUri }: SalesDocumentPdfDocumentProps) {
  const totals = computeTotals(doc.items);
  const { customer, items } = doc;
  const customerName = customer?.name ?? "Deleted customer";

  return (
    <Document
      title={`${doc.label} ${doc.number}`}
      author={settings.companyName}
      subject={`${doc.label} for ${customerName}`}
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>{doc.label}</Text>
            <Text style={styles.documentNumber}>{doc.number}</Text>
            <Text style={styles.statusLine}>Status: {doc.statusLabel}</Text>
          </View>
          <View style={styles.companyBlock}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- this is
                @react-pdf/renderer's Image (a PDF layout node), not an
                HTML <img>; it has no alt prop in its API. */}
            {logoDataUri ? <Image src={logoDataUri} style={styles.companyLogo} /> : null}
            <Text style={styles.companyName}>{settings.companyName}</Text>
            {settings.address ? <Text style={styles.companyLine}>{settings.address}</Text> : null}
            {settings.contactEmail ? (
              <Text style={styles.companyLine}>{settings.contactEmail}</Text>
            ) : null}
            {settings.contactPhone ? (
              <Text style={styles.companyLine}>{settings.contactPhone}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.billTo}>
            <Text style={styles.billToLabel}>Bill to</Text>
            <Text style={styles.billToName}>{customerName}</Text>
            {customer?.company ? <Text style={styles.billToLine}>{customer.company}</Text> : null}
            {customer?.email ? <Text style={styles.billToLine}>{customer.email}</Text> : null}
            {customer?.phone ? <Text style={styles.billToLine}>{customer.phone}</Text> : null}
            {customer?.address ? <Text style={styles.billToLine}>{customer.address}</Text> : null}
          </View>
          <View style={styles.datesBlock}>
            {doc.dates.map((date) => (
              <View key={date.label} style={styles.dateRow}>
                <Text style={styles.dateLabel}>{date.label}</Text>
                <Text style={styles.dateValue}>{formatDate(date.value)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.th, styles.colItem]}>Item</Text>
          <Text style={[styles.th, styles.colQty]}>Qty</Text>
          <Text style={[styles.th, styles.colUnit]}>Unit price</Text>
          <Text style={[styles.th, styles.colDisc]}>Disc %</Text>
          <Text style={[styles.th, styles.colTax]}>Tax %</Text>
          <Text style={[styles.th, styles.colTotal]}>Total</Text>
        </View>

        {items.length === 0 ? (
          <Text style={styles.emptyRow}>No items on this {doc.label.toLowerCase()}.</Text>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.tableRow} wrap={false}>
              <Text style={[styles.td, styles.colItem]}>{item.name || "Untitled item"}</Text>
              <Text style={[styles.td, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.td, styles.colUnit]}>{formatKES(item.unitPrice)}</Text>
              <Text style={[styles.td, styles.colDisc]}>{item.discount}%</Text>
              <Text style={[styles.td, styles.colTax]}>{item.taxRate}%</Text>
              <Text style={[styles.td, styles.colTotal]}>{formatKES(lineItemTotal(item))}</Text>
            </View>
          ))
        )}

        <View style={styles.footerBlock} wrap={false}>
          <View style={styles.notesBlock}>
            {doc.notes ? (
              <>
                <Text style={styles.notesLabel}>Notes</Text>
                <Text style={styles.notesText}>{doc.notes}</Text>
              </>
            ) : null}
            {doc.terms ? (
              <>
                <Text style={styles.notesLabel}>Terms</Text>
                <Text style={styles.notesText}>{doc.terms}</Text>
              </>
            ) : null}
          </View>

          <View style={styles.totalsBlock}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{formatKES(totals.subtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Discount</Text>
              <Text style={styles.totalsValue}>- {formatKES(totals.discount)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Tax</Text>
              <Text style={styles.totalsValue}>{formatKES(totals.tax)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{formatKES(totals.total)}</Text>
            </View>

            {doc.paymentSummary ? (
              <View style={styles.paymentSummary}>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Amount paid</Text>
                  <Text style={styles.totalsValue}>{formatKES(doc.paymentSummary.amountPaid)}</Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Balance due</Text>
                  <Text style={styles.totalsValue}>{formatKES(doc.paymentSummary.balance)}</Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.pageFooter} fixed>
          <Text>{settings.companyName}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export default SalesDocumentPdfDocument;
