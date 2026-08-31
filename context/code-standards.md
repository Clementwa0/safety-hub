# Code Standards

## General

* Keep modules small and single-purpose.
* Fix root causes instead of adding workarounds.
* Do not mix unrelated concerns in one component, service, or route.
* Prefer explicit domain services over duplicated business logic.
* Preserve existing behavior unless the current behavior violates a defined invariant.
* Do not rewrite working functionality without a measurable reason.
* Favor simple, explicit implementations over unnecessary abstraction.
* Keep critical business rules discoverable in one place.
* Avoid hidden side effects.
* Make mutation paths easy to trace from API entry point to database change.

## TypeScript

* Strict TypeScript is required.
* Avoid `any`.
* Prefer explicit interfaces and domain types.
* Do not use unchecked type assertions to silence compiler errors.
* Validate unknown external input at system boundaries.
* Do not trust client-provided calculated totals, stock values, payment status, roles, permissions, or inventory values.
* Use discriminated unions where they improve lifecycle/state safety.
* Keep request DTO types separate from persistence models where practical.
* Reuse existing domain types rather than creating duplicate representations.

## Next.js

* Use App Router conventions.
* Default to server components.
* Use `"use client"` only when browser interactivity requires it.
* Keep route handlers focused on HTTP concerns.
* Route handlers should:

  1. authenticate,
  2. authorize,
  3. validate input,
  4. call the appropriate domain/application service,
  5. return a predictable response.
* Do not place complex inventory, financial, or lifecycle logic directly in route handlers.
* Avoid unnecessary client-side fetching when server-side data can be loaded safely.
* Preserve the existing Sentinel route boundary.

## Styling

* Use Tailwind CSS and the existing component system.
* Reuse shadcn/Base UI components.
* Use existing design tokens.
* Do not introduce arbitrary visual systems for isolated components.
* Avoid hardcoded colors where existing design tokens are available.
* Do not modify shared UI primitives unnecessarily.

## API Routes

Every protected mutation must follow this order:

```text
Request
  ↓
Authentication
  ↓
Authorization
  ↓
Input validation
  ↓
Domain/application service
  ↓
Database transaction where required
  ↓
Audit record where required
  ↓
Response
```

Rules:

* Validate request input before business logic.
* Authenticate before accessing protected resources.
* Authorize before mutations.
* Validate resource ownership where applicable.
* Never trust client-calculated totals.
* Never trust client-provided inventory values.
* Never trust client-provided payment status.
* Never trust client-provided role/permission claims.
* Return consistent response structures.
* Do not expose raw database errors to clients.
* Log internal failures server-side with sufficient diagnostic context.
* Use appropriate HTTP status codes.
* Do not perform long-running unrelated work inside request handlers.

## Inventory

* Never directly modify inventory from UI code.
* Never duplicate reservation logic across routes.
* All inventory mutations must use centralized services.
* Always calculate availability as:

```ts
available = stock - reserved;
```

* Validate quantity is positive.
* Validate quantity is an integer where the business model requires integer quantities.
* Verify current availability before reservation.
* Perform the availability check and reservation atomically.
* Do not rely on quotation-time inventory snapshots during conversion.
* Maintain inventory movement history for operational changes.
* Shipping must convert reserved quantity into a physical stock reduction.
* Cancellation must release reservations where applicable.

## Orders

* New orders must begin in their valid initial state.
* Do not allow clients to create arbitrary lifecycle states.
* Status changes must pass through lifecycle validation.
* Shipped and delivered orders are immutable with respect to commercial line items.
* Historical orders must not be physically deleted.
* Order edits that affect inventory must execute through inventory services.
* Direct staff-created orders must not bypass inventory controls.
* Order-to-invoice conversion must preserve source relationships.

## Quotations

* Quotation pricing and availability are snapshots at quotation time.
* Snapshots are historical information, not current inventory authority.
* Accepted quotations must recheck live inventory before conversion.
* Quotation-to-order conversion must be transactional.
* Converted quotations must remain traceable.
* Do not delete quotations that are referenced by orders.
* Do not silently alter historical quotation values after conversion.

## Invoices

* Invoice totals are server-authoritative.
* `amountPaid` must not be directly client-controlled.
* Payment records are the authoritative payment ledger.
* Issued invoices must not be physically deleted.
* Draft deletion is permitted only when the existing business rules allow it.
* Invoice lifecycle transitions must be validated.
* Invoice/payment updates that modify multiple records must use transactions.

## Payments

* Payments must be recorded through the payment service.
* Payment amounts must be validated server-side.
* Payment status must be derived from authoritative records.
* Payment voiding must require authorization.
* Payment voiding must be auditable.
* Never silently delete a historical payment.
* Do not allow arbitrary invoice updates to alter payment balances.

## Audit

Sensitive actions should generate audit events, including:

* Inventory adjustments
* Inventory reservations/releases where operationally significant
* Order status changes
* Quotation acceptance/conversion
* Invoice issuance/cancellation
* Payment creation
* Payment voiding
* Product archival
* Customer archival
* User/staff changes
* Settings changes
* Permission changes

Audit records should identify:

* Actor
* Action
* Entity type
* Entity ID
* Relevant document number
* Timestamp
* Before/after values where appropriate
* Relevant metadata

## Data and Storage

* Business metadata belongs in MongoDB.
* Large media belongs in Cloudinary.
* Do not store large binary files directly in MongoDB.
* Preserve historical references between commercial documents.
* Prefer archival over destructive deletion for business entities.
* Add database indexes for frequently queried identifiers and uniqueness requirements.
* Use database-level constraints/indexes for invariants that must survive application bugs or concurrency.

## Error Handling

* Do not expose raw MongoDB/Mongoose errors to clients.
* Use safe, user-facing error messages.
* Log detailed errors server-side.
* Preserve error context for debugging.
* Do not silently convert financial/database failures into successful business operations.
* Financial operations must fail closed if required configuration is unavailable.

## Testing

Critical business rules require tests.

Prioritize:

* Inventory availability
* Reservation
* Reservation concurrency
* Reservation release
* Shipment
* Order cancellation
* Quotation conversion
* Variant inventory
* Invoice lifecycle
* Payment recording
* Payment voiding
* Financial calculations
* Authorization
* Historical document protection

Tests should verify both success and failure paths.

## File Organization

* `app/` — Next.js routes, layouts, pages, and API boundaries.
* `features/` — UI and feature-specific client/application presentation.
* `modules/` — server-side domain and business logic.
* `services/` — reusable API/client service wrappers and application service boundaries.
* `lib/models/` — Mongoose schemas and persistence models.
* `lib/auth/` — authentication, sessions, and authorization.
* `lib/validation/` — Zod schemas and request validation.
* `components/ui/` — shared UI primitives.
* `hooks/` — reusable React hooks.
* `store/` — client-side state management.
* `types/` — shared application types.
* `tests/` — unit and integration tests.
* `scripts/` — development, migration, and maintenance scripts.

## Protected Files

Do not modify unless explicitly required:

* `components/ui/*`
* Third-party library internals
* Generated files
* Build output
* Existing authentication configuration unless the current task explicitly concerns authentication
* Existing financial calculation behavior unless the task explicitly concerns financial integrity

## Database Rules

* Add indexes deliberately.
* Prefer database-level uniqueness where race conditions are possible.
* Use MongoDB transactions for multi-document critical operations.
* Do not rely solely on application-level checks for uniqueness or concurrency-sensitive invariants.
* Avoid direct database mutation from presentation code.
