# AGENTS.md

# Safety Hub — AI Agent Instructions

## Mission

You are working on **Safety Hub**, a production PPE commerce and business operations platform.

Your job is to improve the existing system while preserving working functionality and strengthening:

* Inventory integrity
* Order integrity
* Quotation integrity
* Invoice integrity
* Payment integrity
* Authorization
* Auditability
* Type safety
* Maintainability
* UI consistency

Do not rewrite the application unnecessarily.

Fix root causes rather than adding patches around symptoms.

---

# Required Context

Before implementing any meaningful change, read the relevant context files:

# context/

* `project-context.md`
* `architecture.md`
* `code-standards.md`
* `ai-workflow.md`
* `progress-tracker.md`
* `ui-context.md`

These files are the project's source of truth.

If the implementation conflicts with a context file, stop and resolve the conflict before proceeding.

---

# Core Rules

## 1. Work Incrementally

Work on **one implementation unit at a time**.

Do not implement an entire phase in one pass.

For each unit:

1. Analyze the existing implementation.
2. Identify all affected files and call paths.
3. Identify the relevant business invariants.
4. Implement the smallest correct change.
5. Add or update tests.
6. Verify failure paths.
7. Run the build.
8. Update `progress-tracker.md`.
9. Only then proceed to the next unit.

---

# 2. Do Not Invent Business Behavior

Never invent financial, inventory, authorization, or lifecycle behavior merely because it seems convenient.

If behavior is unclear:

1. Inspect the existing models.
2. Inspect services.
3. Inspect route handlers.
4. Inspect UI behavior.
5. Inspect tests.
6. Check `architecture.md`.
7. Document unresolved questions in `progress-tracker.md`.

Do not silently make financial policy decisions.

---

# 3. Preserve Existing Functionality

Before modifying a feature, understand how it currently works.

Do not:

* Rewrite working modules without reason.
* Change unrelated APIs.
* Replace libraries unnecessarily.
* Change authentication architecture unnecessarily.
* Redesign unrelated UI.
* Rename large portions of the project without need.
* Remove existing functionality to make a build pass.

A bug fix should remain a bug fix.

A feature implementation should not become an uncontrolled refactor.

---

# 4. Architecture Boundaries

Respect the existing application boundaries.

```text
app/
  ↓
HTTP / routing boundary

features/
  ↓
UI / feature presentation

modules/
  ↓
Business/domain logic

services/
  ↓
Application/API service boundaries

lib/models/
  ↓
Persistence

lib/auth/
  ↓
Authentication / authorization

lib/validation/
  ↓
Input validation
```

Critical business logic belongs in domain/application services, not inside UI components or route handlers.

---

# 5. Inventory Is a Critical Domain

Inventory must have a single authoritative mutation path.

Never directly modify:

```text
stock
reserved
available
```

from UI code or arbitrary route handlers.

Availability is:

```text
available = stock - reserved
```

The system must never allow:

```text
reserved > stock
```

Inventory checks and reservations must be atomic where concurrency can occur.

Quotation-time availability is not authoritative during quotation conversion.

Always recheck live inventory before converting a quotation into an order.

---

# 6. Financial Operations Are Critical

Treat these as financial records:

* Quotations
* Orders
* Invoices
* Payments
* Payment voids
* Financial settings

Never trust client-provided:

* Totals
* Amount paid
* Balance
* Payment status
* Tax calculations
* Inventory quantities
* Reservation quantities

Recalculate authoritative values server-side.

Historical financial records must not be destructively deleted.

---

# 7. Commercial Relationships Must Remain Intact

Protect:

```text
Quotation
    ↓
Order
    ↓
Invoice
    ↓
Payment
```

Do not allow an operation to leave broken historical references.

Converted quotations must remain traceable.

Issued invoices must remain traceable.

Historical payments must remain traceable.

Prefer lifecycle changes, cancellation, voiding, or archival over destructive deletion.

---

# 8. Authorization

Every protected mutation must follow:

```text
Authentication
    ↓
Authorization
    ↓
Input validation
    ↓
Business logic
    ↓
Database mutation
    ↓
Audit
```

Never rely on UI restrictions as security.

A hidden button is not authorization.

Every sensitive operation must be protected server-side.

---

# 9. Validation

Validate external input at the system boundary.

Use the existing Zod validation approach.

Do not allow invalid input to reach business logic.

Do not use:

```ts
any
```

to bypass type errors.

Do not use unsafe type assertions merely to silence TypeScript.

---

# 10. Transactions

Use MongoDB transactions when multiple related records must succeed or fail together.

Examples:

```text
Quotation → Order → Inventory reservation
```

```text
Order → Invoice
```

```text
Payment → Invoice financial state
```

A transaction must not be added merely for appearance.

Identify the actual consistency boundary first.

---

# 11. API Route Rules

Route handlers should remain thin.

Preferred structure:

```text
Request
  ↓
Authentication
  ↓
Authorization
  ↓
Validation
  ↓
Domain/Application Service
  ↓
Transaction
  ↓
Audit
  ↓
Response
```

Do not place complex domain logic directly inside route handlers.

Do not duplicate business rules across endpoints.

---

# 12. UI Rules

Use the existing UI architecture.

* Next.js App Router
* React
* Tailwind CSS
* shadcn/Base UI
* Lucide icons
* Existing design tokens
* Existing responsive patterns

Read `ui-context.md` before making substantial UI changes.

Do not introduce a separate visual language for a single page.

Do not modify `components/ui/*` unless explicitly necessary.

---

# 13. Sentinel

The administrative application uses the **Sentinel** route boundary.

Do not casually rename or expose the administrative area as `/admin`.

Preserve the existing authentication and authorization architecture unless the task explicitly concerns it.

---

# 14. Testing

Critical business logic must have tests.

Prioritize tests for:

* Inventory availability
* Inventory reservation
* Reservation release
* Shipment
* Concurrent reservations
* Quotation conversion
* Order lifecycle
* Invoice lifecycle
* Payment recording
* Payment voiding
* Authorization
* Transaction rollback
* Historical record protection

Test both:

```text
success
```

and:

```text
failure
```

paths.

---

# 15. Search for Bypass Paths

When implementing a business rule, do not only modify the obvious route.

Search the entire codebase for:

* Direct database mutations
* Alternative API routes
* Admin actions
* Server actions
* Background jobs
* Utility functions
* Client-side mutations
* Legacy implementations

A business invariant is not complete if another code path can bypass it.

---

# 16. Database Changes

Before changing a model or database structure:

1. Identify all consumers.
2. Identify existing data.
3. Identify indexes.
4. Identify backwards compatibility concerns.
5. Determine whether migration/backfill is required.
6. Update `architecture.md` if the storage model changes.

Never make destructive schema changes casually.

---

# 17. Documentation

Whenever implementation changes architecture or business behavior, update the appropriate context file.

At minimum:

```text
progress-tracker.md
```

For architectural changes also update:

```text
architecture.md
```

For coding conventions:

```text
code-standards.md
```

For UI decisions:

```text
ui-context.md
```

---

# 18. Completion Checklist

An implementation unit is complete only when:

* [ ] The intended behavior works.
* [ ] Existing related behavior still works.
* [ ] Business invariants are preserved.
* [ ] Authorization is enforced.
* [ ] Input is validated.
* [ ] Transactions are used where required.
* [ ] No obvious bypass path remains.
* [ ] Tests pass.
* [ ] Type checking passes.
* [ ] `npm run build` passes.
* [ ] `progress-tracker.md` is updated.
* [ ] Relevant architecture/context documentation is updated.

Do not report a task as complete merely because the modified file compiles.

---

# Current Priority

Follow `progress-tracker.md`.

The current implementation roadmap begins with:

```text
Phase 1 — Inventory Integrity

Unit 1
Centralize Stock Mutations
```

Do not jump ahead to Phase 2 unless the current unit is verified and marked complete.

---

# Final Principle

**Correctness over convenience.**

**Root-cause fixes over patches.**

**Domain invariants over UI restrictions.**

**Server authority over client calculations.**

**Atomic operations over partially consistent state.**

**Small verified changes over large speculative refactors.**
