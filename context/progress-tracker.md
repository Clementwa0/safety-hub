# Progress Tracker

## Current Phase
Phase 1 - Inventory Integrity

## Current Specification
**Spec 13 - Financial Integration Tests**

Status: Complete

## Completed
- Spec 01 - Centralize Inventory Mutations
- Spec 02 - Fix Simple Product Availability
- Spec 03 - Transactional Quotation → Order
- Spec 04 - Prevent Over-Reservation
- Spec 05 - Protect Shipped Orders
- Spec 06 - Protect Historical Orders
- Spec 07 - Protect Direct Order Creation
- Spec 08 - Protect Invoice Lifecycle
- Spec 09 - Protect Commercial Relationships
- Spec 10 - Add Audit Trail
- Spec 11 - Fail Closed on Financial Settings
- Spec 12 - Payment Authorization
- Spec 13 - Financial Integration Tests

## Future Work
See `future-specs/`.

## Next
Stop after verification and documentation.

## Open Questions
- None.

## Architecture Decisions
- Inventory availability is enforced at the domain boundary, not in route handlers or UI components.
- The reservation path rechecks live stock/reserved values before attempting a reservation and aborts any attempt that would push `reserved` above `stock` or create negative availability.
- The fix preserves the existing central inventory service contract and adds concurrency coverage for both simple products and variant-specific reservations.
- Commercial order lines are immutable after shipment; the server compares the incoming commercial fields with the persisted snapshot before saving a shipped or delivered order.
- Physical order deletion is limited to active non-historical statuses: pending, confirmed, and processing. Shipped, delivered, and cancelled orders remain intact to preserve audit history.
- Guest storefront orders are owned by their opaque cart session and retain their contact/address snapshot; they do not require or create a storefront user account. Checkout creates the order and its centralized inventory reservations in one transaction.

## Session Notes
- Root cause: `reserveAvailableStock()` read availability and then called `reserveStock()` without serializing concurrent attempts. Two simultaneous calls could each read the same available quantity and both reserve it.
- Fix: `reserveAvailableStock()` now recomputes live availability, clamps the requested quantity to the current available amount, and retries on `INSUFFICIENT_STOCK` races until the reservation is safely bounded by real stock.
- Verification: `npm test -- --test-name-pattern "inventory service"` passed with 76/76 tests green; `npm run build` passed successfully.
- Spec 05: the order edit UI locks shipped/delivered line items while retaining valid pre-shipment edits. Server-side lifecycle checks reject changed items, quantities, products, variants, additions/removals, and price changes on shipped/delivered orders. `pnpm test` passed with 80 tests; `pnpm exec tsc --noEmit` and `pnpm build` passed.
- Spec 06: delete protection is enforced in the order domain and API route. Only pending/confirmed/processing orders may be deleted; shipped, delivered, and cancelled orders are rejected to keep audit history intact. The focused `pnpm test -- --test-name-pattern "historical orders|shipped order line-item protection"` check passed after the fix.
- Guest checkout: added transaction-backed integration coverage for successful guest orders, validation failures, authoritative server pricing/totals, insufficient-stock rollback, concurrent reservations, and authenticated ownership. The existing checkout flow already stores guest contact/address data on `StoreOrder`, uses `sessionId` ownership without a user account, and reserves inventory atomically. `pnpm test`, `pnpm exec tsc --noEmit`, and `pnpm build` passed.
