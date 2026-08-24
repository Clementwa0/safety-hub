import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  calculateInvoiceBalance,
  calculateInvoiceTax,
  calculateInvoiceTotals,
  calculateLineItemTotal,
  calculatePaymentStatus,
  roundMoney,
  sumActivePayments,
  MONEY_EPSILON,
} from "@/modules/invoicing/calculations";

describe("roundMoney", () => {
  it("fixes classic floating-point drift", () => {
    assert.equal(roundMoney(0.1 + 0.2), 0.3);
  });

  it("rounds to the nearest cent", () => {
    assert.equal(roundMoney(1.005), 1.01);
    assert.equal(roundMoney(1.004), 1.0);
  });
});

describe("calculateLineItemTotal", () => {
  it("applies a percentage discount to gross", () => {
    // 5 * 200 = 1000 gross, 10% discount => 900
    assert.equal(calculateLineItemTotal({ quantity: 5, unitPrice: 200, taxRate: 0, discount: 10 }), 900);
  });

  it("never goes negative even with a 100%+ discount", () => {
    assert.equal(calculateLineItemTotal({ quantity: 1, unitPrice: 100, taxRate: 0, discount: 100 }), 0);
  });
});

describe("calculateInvoiceTotals", () => {
  it("computes subtotal/discount/tax/total consistently across multiple lines", () => {
    const items = [
      { quantity: 2, unitPrice: 500, taxRate: 16, discount: 0 }, // 1000 gross, 160 tax
      { quantity: 1, unitPrice: 300, taxRate: 16, discount: 10 }, // 300 gross, 30 disc, 43.2 tax
    ];
    const totals = calculateInvoiceTotals(items);

    assert.equal(totals.subtotal, 1300);
    assert.equal(totals.discount, 30);
    // (1000 * 0.16) + (270 * 0.16) = 160 + 43.2 = 203.2
    assert.equal(totals.tax, 203.2);
    // subtotal - discount + tax = 1300 - 30 + 203.2
    assert.equal(totals.total, 1473.2);

    // Internal consistency: total must equal subtotal - discount + tax
    // exactly (to the cent), never drift from its own components.
    assert.equal(roundMoney(totals.subtotal - totals.discount + totals.tax), totals.total);
  });

  it("handles an empty line-item list", () => {
    assert.deepEqual(calculateInvoiceTotals([]), { subtotal: 0, discount: 0, tax: 0, total: 0 });
  });

  it("matches calculateInvoiceTax for the tax component", () => {
    const items = [{ quantity: 3, unitPrice: 150, taxRate: 16, discount: 5 }];
    assert.equal(calculateInvoiceTax(items), calculateInvoiceTotals(items).tax);
  });

  it("is structurally satisfied by a client LineItem with extra fields", () => {
    // Guards the exact bug the duplicated invoiceTotal()/total() helpers
    // existed to work around: this must compile and run without a cast
    // even though LineItem has more fields (id, name, ...) than
    // MoneyLineItem requires.
    const clientShaped = [
      { id: "li_1", name: "Widget", quantity: 2, unitPrice: 100, taxRate: 0, discount: 0 },
    ];
    assert.equal(calculateInvoiceTotals(clientShaped).total, 200);
  });
});

describe("calculateInvoiceBalance", () => {
  it("returns total minus amountPaid", () => {
    assert.equal(calculateInvoiceBalance(1000, 400), 600);
  });

  it("floors at zero rather than going negative", () => {
    assert.equal(calculateInvoiceBalance(1000, 1500), 0);
  });

  it("treats a payment within MONEY_EPSILON of the total as fully paid", () => {
    const balance = calculateInvoiceBalance(1000, 1000 - MONEY_EPSILON / 2);
    assert.ok(balance <= MONEY_EPSILON);
  });
});

describe("calculatePaymentStatus", () => {
  it("is unpaid when nothing has been paid", () => {
    assert.equal(calculatePaymentStatus(1000, 0), "unpaid");
  });

  it("is partially_paid for a partial payment", () => {
    assert.equal(calculatePaymentStatus(1000, 400), "partially_paid");
  });

  it("is paid for an exact full payment", () => {
    assert.equal(calculatePaymentStatus(1000, 1000), "paid");
  });

  it("is paid for a payment within MONEY_EPSILON of the total (float-safe)", () => {
    assert.equal(calculatePaymentStatus(999.9999999, 1000), "paid");
  });

  it("is never paid for a payment meaningfully short of the total", () => {
    assert.equal(calculatePaymentStatus(1000, 999.9 - MONEY_EPSILON), "partially_paid");
  });
});

describe("sumActivePayments", () => {
  it("sums only non-voided payments", () => {
    const total = sumActivePayments([
      { amount: 500, status: "recorded" },
      { amount: 300, status: "voided" },
      { amount: 200, status: "recorded" },
    ]);
    assert.equal(total, 700);
  });

  it("returns 0 for an empty or fully-voided ledger", () => {
    assert.equal(sumActivePayments([]), 0);
    assert.equal(sumActivePayments([{ amount: 100, status: "voided" }]), 0);
  });
});
