# Code Standards

## General
- Keep modules small and single-purpose.
- Fix root causes; avoid workarounds.
- Avoid unrelated refactors.
- Prefer explicit domain services.
- Keep critical rules discoverable.
- Avoid hidden side effects.

## TypeScript
- Strict TypeScript.
- Avoid `any`.
- Prefer explicit domain types.
- Validate unknown input at boundaries.
- Avoid unsafe assertions used only to silence errors.
- Keep request DTOs separate from persistence types where useful.

## Next.js
- Use App Router conventions.
- Prefer server components.
- Use `"use client"` only when required.
- Keep route handlers thin.
- Keep business logic out of routes and UI.

## API
```text
Authentication → Authorization → Validation → Domain Service → Transaction → Audit → Response
```
- Validate with Zod.
- Never trust client totals, payments, stock, roles, or permissions.
- Do not expose raw database errors.
- Return predictable responses.

## Inventory
- Never mutate stock/reserved from UI.
- Centralize mutations.
- Validate quantities.
- Recheck live availability.
- Make check + reservation atomic where required.
- Preserve inventory movement history.

## Orders / Quotations
- Validate lifecycle transitions.
- Protect shipped/historical orders.
- Preserve quotation/order relationships.
- Recheck inventory during conversion.

## Invoices / Payments
- Totals are server-authoritative.
- Payment records are the ledger.
- Protect issued invoices.
- Payment voids require authorization and audit.
- Do not alter balances through arbitrary invoice updates.

## Database
- Add indexes deliberately.
- Use database uniqueness where race conditions matter.
- Use transactions for critical multi-document operations.
- Prefer archival/lifecycle changes over destructive deletion.

## Testing
Prioritize inventory, concurrency, lifecycle, conversion, payments, authorization, rollback, and historical protection. Test success and failure paths.

## Protected
Do not modify unless required: `components/ui/*`, third-party internals, generated/build files, secrets, unrelated modules.
