# Progress Tracker

## Current Phase

**Phase 1 — Inventory Integrity**

Status: **In Progress**

## Current Goal

Establish a single authoritative inventory domain and eliminate inventory/order lifecycle paths that can produce inconsistent stock, reserved quantities, or historical records.

## Completed

### Codebase Analysis

* Analyzed the current Next.js application architecture.
* Confirmed Next.js App Router architecture.
* Confirmed MongoDB/Mongoose persistence.
* Confirmed NextAuth authentication.
* Confirmed Sentinel administrative boundary.
* Identified existing inventory, quotation, order, invoice, and payment modules.
* Identified existing transaction usage in invoice/payment operations.
* Identified critical inventory and lifecycle integrity gaps.
* Identified the need for centralized inventory mutations.
* Identified the need for audit logging.
* Identified the need for stronger financial authorization and integration testing.

## In Progress

### Phase 1 — Unit 3: Transactional Quotation Conversion

* Quotation conversion now reloads the quotation inside a MongoDB transaction.
* Order creation, atomic inventory reservations, and quotation linking share
  the same session and roll back together on failure.
* Existing conversion remains idempotent by returning an already-linked order.
* Order cancellation now treats an already-missing reservation as an
  idempotent no-op, preventing valid retries/legacy orders from returning 500.
* Quotation conversion now permits insufficient inventory: it atomically
  reserves the available portion and records `AVAILABLE`,
  `PARTIALLY_AVAILABLE`, or `BACKORDERED` fulfillment state on the order.
* Fulfillment uses each line's reserved quantity and rejects shipment of
  partially available/backordered orders; invoice conversion remains a
  billing-only operation and does not mutate inventory.
* Verification: `pnpm exec tsc --noEmit` passes. Production build is currently
  blocked by a Turbopack worker `EPERM` while binding a local port in this
  environment; the same build passed before this Unit 3 change.

### Phase 1 — Unit 2: Fix Simple Product Reserved Handling

* Added a shared `getAvailableQuantity()` projection for simple products:
  `max(0, stock - reserved)`.
* Cart serialization and add/update validation now use sellable availability
  for simple products, matching existing variant behavior.
* Storefront product cards, detail pages, galleries, category/shop filters, and
  Sentinel inventory fallback calculations now account for reservations.
* Product normalization and storefront types preserve the optional reserved
  quantity needed by these projections.
* Added unit coverage for the shared projection and quotation availability.
* Verification: `pnpm exec tsc --noEmit` passed, `pnpm test` passed (73 tests),
  and `pnpm build` passed.

### Phase 1 — Unit 1: Centralize Stock Mutations

* Added `modules/inventory/inventory.service.ts` as the sole production
  writer for `Product.stock` and `Product.reserved`.
* Migrated checkout reservations, quotation conversion reservations, order
  shipment/cancellation, store-order shipment/cancellation, and simple
  product stock adjustments to the inventory service.
* Product variant configuration updates now preserve authoritative existing
  reservations; product creation and duplication explicitly start unreserved.
* Added `tests/modules/inventory/inventory.service.test.ts` for reservation,
  release, shipment, adjustment, availability, variant rollups, and variant
  configuration behavior.
* Fixed explicit typing issues in product duplication, variant inventory
  lookups, product variant rollups, and checkout reservation calls.
* Verification: `pnpm exec tsc --noEmit` completed after the fix with no
  TypeScript errors reported in the previously failing files.

## Next Up

### Phase 1 — Unit 3

**Transactional quotation conversion**

Target:

```text
modules/inventory/
├── inventory.service.ts
├── reservation.service.ts
├── shipment.service.ts
├── adjustment.service.ts
├── availability.ts
└── movements.ts
```

Required behavior:

* `getAvailableStock()`
* `reserveStock()`
* `releaseReservation()`
* `shipReservedStock()`
* `adjustStock()`

All inventory mutations must use these domain services.

## Phase 1 Roadmap

### Unit 1 — Centralize Stock Mutations

Status: Complete

* [x] Identify every stock mutation.
* [x] Identify every reserved mutation.
* [x] Create authoritative inventory service.
* [x] Migrate checkout.
* [x] Migrate order shipment.
* [x] Migrate order cancellation.
* [x] Migrate quotation conversion.
* [x] Migrate store-order fulfillment.
* [x] Migrate inventory adjustments.
* [x] Remove direct business-level stock mutations from routes.
* [x] Add tests.

### Unit 2 — Fix Simple Product Reserved Handling

Status: Complete

* [x] Define simple product availability as `stock - reserved`.
* [x] Fix cart availability.
* [x] Fix checkout availability.
* [x] Fix quotation availability.
* [x] Verify Sentinel inventory calculations.
* [x] Add tests.

### Unit 3 — Transactional Quotation Conversion

Status: In progress

* [ ] Recheck quotation lifecycle.
* [ ] Recheck current inventory.
* [ ] Create order inside transaction.
* [ ] Reserve inventory inside transaction.
* [ ] Mark quotation converted inside transaction.
* [ ] Roll back all changes on failure.
* [ ] Add integration tests.

### Unit 4 — Prevent Over-Reservation

Status: Not started

* [ ] Make availability check atomic with reservation.
* [ ] Verify variant-specific inventory.
* [ ] Test concurrent reservation.
* [ ] Guarantee `reserved <= stock`.

### Unit 5 — Prevent Editing Shipped Orders

Status: Not started

* [ ] Reject item mutations after shipment.
* [ ] Reject quantity mutations after shipment.
* [ ] Reject variant/product changes after shipment.
* [ ] Verify API enforcement.
* [ ] Verify UI does not falsely imply editing is available.

### Unit 6 — Prevent Deletion of Historical Orders

Status: Not started

* [ ] Define deletable order states.
* [ ] Prevent deletion after shipment.
* [ ] Prevent deletion when inventory movements exist.
* [ ] Prefer cancellation/void/archive lifecycle.

### Unit 7 — Prevent Direct Orders from Bypassing Inventory

Status: Not started

* [ ] Review staff order creation.
* [ ] Enforce current inventory verification.
* [ ] Reserve stock where required.
* [ ] Prevent creation directly in shipment states unless explicitly supported by domain rules.
* [ ] Add tests.

## Phase 2 Roadmap

### Unit 8 — Protect Invoice Lifecycle

Status: Not started

* [ ] Validate creation state.
* [ ] Validate transitions.
* [ ] Protect issued invoices.
* [ ] Prevent destructive deletion.
* [ ] Preserve financial totals.

### Unit 9 — Protect Quotation → Order → Invoice Relationships

Status: Not started

* [ ] Prevent deletion of converted quotations.
* [ ] Preserve source references.
* [ ] Prevent modification that breaks historical relationships.
* [ ] Validate conversion prerequisites.

### Unit 10 — Add Audit Trail

Status: Not started

Target:

```text
modules/audit/
├── audit.service.ts
├── audit.types.ts
└── ...
```

Model:

```text
AuditLog
├── actorId
├── action
├── entityType
├── entityId
├── entityNumber
├── before
├── after
├── metadata
└── createdAt
```

### Unit 11 — Fail Closed on Financial Settings

Status: Not started

* [ ] Identify all financial settings dependencies.
* [ ] Separate display fallback behavior from financial mutation behavior.
* [ ] Ensure checkout/invoicing cannot silently use unsafe defaults.
* [ ] Add failure tests.

### Unit 12 — Payment Authorization

Status: Not started

* [ ] Define payment-record permission.
* [ ] Define payment-void permission.
* [ ] Enforce server-side authorization.
* [ ] Audit sensitive payment operations.
* [ ] Add unauthorized-operation tests.

### Unit 13 — Financial Integration Tests

Status: Not started

* [ ] Invoice lifecycle tests.
* [ ] Payment recording tests.
* [ ] Payment void tests.
* [ ] Balance calculation tests.
* [ ] Transaction rollback tests.
* [ ] Authorization tests.

## Open Questions

1. Should staff-created direct orders reserve inventory immediately, or may staff create explicitly unreserved orders?
2. Which exact order states are considered cancellable?
3. Which exact invoice states permit editing?
4. Which staff roles may record payments?
5. Which staff roles may void payments?
6. Should inventory adjustments require a reason/comment?
7. Should every inventory reservation/release generate an audit event, or should inventory movements provide sufficient operational history?
8. Should products, customers, and categories use an explicit `archived` field or an existing active/inactive mechanism?
9. Should product SKUs and variant SKUs be globally unique?

These questions must be resolved before implementing behavior that depends on them.

## Architecture Decisions

### Inventory Authority

Inventory mutations will be centralized in domain services.

**Reason:** Multiple current routes can modify stock/reserved state. Centralization prevents divergent business rules.

### Availability Formula

```text
available = stock - reserved
```

**Reason:** Reserved inventory is committed inventory and cannot be presented as freely available.

### Transactional Commercial Conversion

Quotation-to-order conversion must use a MongoDB transaction.

**Reason:** Order creation, inventory reservation, and quotation conversion must succeed or fail together.

### Historical Record Protection

Historical commercial records should be archived/cancelled rather than physically deleted.

**Reason:** Orders, invoices, payments, quotations, and inventory movements form an auditable business history.

### Payment Ledger

Payment records are authoritative for invoice payment state.

**Reason:** Directly mutating `amountPaid` creates reconciliation risk.

### Fail-Closed Financial Operations

Financial operations must fail when required financial configuration cannot be retrieved.

**Reason:** A silent fallback can produce incorrect tax, shipping, totals, or payment calculations.

## Session Notes

The current implementation has good foundations, including Mongoose models, NextAuth authentication, Sentinel authorization boundaries, invoice/payment transactions, and Zod validation.

The immediate focus is not a rewrite.

The implementation should harden the existing architecture by centralizing domain invariants and removing mutation bypasses.

The first implementation unit is **centralized inventory mutation**, followed by simple-product availability, transactional quotation conversion, and order lifecycle protection.
