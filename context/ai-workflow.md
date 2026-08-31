# AI Workflow Rules

## Approach

Build Safety Hub incrementally using a spec-driven workflow.

The project context files define:

* What the system does
* What behavior is allowed
* Which invariants must never be violated
* Where business logic belongs
* How implementation should be verified
* What work has already been completed

Always implement against these specifications.

Do not infer new product behavior merely because a technically convenient implementation is possible.

The primary principle is:

> Preserve existing functionality while strengthening business correctness, security, and architectural boundaries.

Fix root causes rather than layering patches around symptoms.

## Initial Analysis Before Every Implementation Unit

Before changing code:

1. Identify the exact feature/unit being changed.
2. Inspect the current implementation.
3. Identify all routes, services, models, schemas, and callers involved.
4. Identify existing invariants.
5. Identify transaction boundaries.
6. Identify authorization requirements.
7. Identify related tests.
8. Determine whether the change affects historical data.
9. Determine whether the change affects inventory or financial integrity.
10. Update the relevant context/progress documentation if a requirement or architecture decision changes.

Do not begin implementation based solely on a single file.

## Scoping Rules

* Work on one feature unit at a time.
* Prefer small, verifiable increments.
* Do not combine unrelated system boundaries.
* Avoid broad refactors while implementing a business rule.
* Keep inventory changes separate from UI redesign.
* Keep financial changes separate from unrelated storefront changes.
* Keep authentication changes separate unless authentication is part of the requirement.
* Do not change database schemas without identifying migration/data implications.

## Phase 1 Implementation Order

### Unit 1 — Centralize Inventory Mutations

Create or consolidate inventory domain services responsible for:

```text
reserveStock()
releaseReservation()
shipReservedStock()
adjustStock()
getAvailableStock()
```

No route should directly implement these business operations.

Verification:

* Search for direct stock/reserved mutations.
* Confirm all production mutation paths use the inventory service.
* Add tests for each mutation.

### Unit 2 — Fix Simple Product Availability

Ensure simple products use:

```text
available = stock - reserved
```

Verify:

* Cart
* Product display
* Checkout
* Orders
* Quotations
* Inventory calculations

### Unit 3 — Transactional Quotation Conversion

Quotation conversion must perform:

```text
validate quotation
    ↓
recheck live inventory
    ↓
create order
    ↓
reserve inventory
    ↓
mark quotation converted
```

inside one transaction.

If any operation fails, all changes must roll back.

### Unit 4 — Prevent Over-Reservation

Availability verification and reservation must be atomic.

Test concurrent requests.

The database must not end with:

```text
reserved > stock
```

### Unit 5 — Protect Shipped Orders

Prevent modification of commercial line items after shipment.

Do not introduce a workaround that merely hides UI controls. The API/domain layer must reject the mutation.

### Unit 6 — Protect Historical Orders

Prevent deletion of shipped/delivered/historically relevant orders.

Use lifecycle/archival behavior instead of destructive deletion.

### Unit 7 — Protect Direct Order Creation

Ensure staff-created orders use the same inventory rules as other order creation paths.

No endpoint may bypass reservation/availability requirements.

## Phase 2 Implementation Order

### Unit 8 — Protect Invoice Lifecycle

* Enforce valid invoice states.
* Prevent deletion of issued/historical invoices.
* Keep draft-only deletion where currently allowed.
* Prevent arbitrary changes to financial totals.

### Unit 9 — Protect Commercial Relationships

Protect:

```text
Quotation → Order → Invoice → Payment
```

Historical references must remain valid.

Do not allow destructive operations that leave broken references.

### Unit 10 — Add Audit Trail

Implement an audit service and model.

Use the audit service from sensitive domain operations rather than scattering audit creation across UI components.

### Unit 11 — Fail Closed on Financial Settings

Financial operations must not silently use default/fallback financial values when required settings cannot be retrieved.

Display-only operations may use safe defaults where appropriate.

Financial mutations must fail safely.

### Unit 12 — Payment Authorization

Define and enforce who may:

* Record payments
* Void payments
* Modify invoice state
* Cancel invoices

Authorization must be enforced server-side.

### Unit 13 — Financial Integration Tests

Add end-to-end/integration coverage for:

* Invoice creation
* Invoice issuance
* Payment recording
* Payment voiding
* Amount paid
* Balance due
* Status transitions
* Unauthorized payment operations
* Transaction rollback

## When to Split Work

Split an implementation step if it combines:

* UI changes and database/domain changes without a direct dependency.
* Multiple unrelated API routes.
* Inventory and authentication changes.
* Financial behavior and unrelated storefront features.
* Multiple database migrations with unrelated purposes.
* Behavior that is not clearly defined by the context files.
* Changes that cannot be verified independently.

If a change cannot be verified end-to-end quickly, the scope is too broad.

## Handling Missing Requirements

* Do not invent product behavior.
* Preserve existing behavior unless it violates an explicit invariant.
* If behavior is ambiguous, inspect existing models, services, UI, and tests first.
* If ambiguity remains, document it in `progress-tracker.md`.
* Do not silently choose a financial policy.
* Do not silently choose an inventory policy.
* Do not change lifecycle semantics without documenting the decision.

## Protected Files

Do not modify unless explicitly required:

* `components/ui/*`
* Third-party library code
* Generated files
* Build artifacts
* Environment files containing secrets
* Unrelated feature modules

## Keeping Documentation in Sync

Update the context files whenever implementation changes:

* System architecture
* Domain boundaries
* Inventory rules
* Financial rules
* Storage decisions
* Authorization policies
* Lifecycle behavior
* Testing requirements

Update `progress-tracker.md` after every meaningful implementation unit.

## Verification Requirements

Before considering a unit complete:

1. Run targeted tests.
2. Run type checking where available.
3. Inspect changed files for unintended mutations.
4. Search for bypass paths.
5. Verify authorization.
6. Verify transaction boundaries.
7. Verify failure/rollback behavior.
8. Run `npm run build`.
9. Update `progress-tracker.md`.
10. Confirm no architecture invariant was violated.

## Before Moving to the Next Unit

The current unit must:

1. Work end-to-end within its defined scope.
2. Preserve unrelated existing behavior.
3. Not violate any invariant defined in `architecture.md`.
4. Have appropriate tests.
5. Have no known bypass path.
6. Have `progress-tracker.md` updated.
7. Have relevant documentation updated.
8. Pass `npm run build`.

Never mark a unit complete merely because the modified file compiles.
