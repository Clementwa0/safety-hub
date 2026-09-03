# Safety Hub - AI Agent Instructions

## Mission
Improve the existing Safety Hub system without unnecessary rewrites.

Priorities: correctness, security, inventory, finance, auditability, type safety, maintainability, UI consistency.

## Source of Truth
Read relevant files in `context/` before meaningful work. For future work, read the selected file in `future-specs/`.

If sources conflict, stop and resolve the conflict.

## Core Rules
- One specification at a time.
- Analyze before coding.
- Fix root causes.
- Preserve unrelated working behavior.
- Do not invent business behavior.
- Search for bypass paths.
- Never weaken security, inventory, or financial invariants.

## Architecture
```text
app/            HTTP/routes
features/       UI/presentation
modules/        domain/business logic
services/       application/API wrappers
lib/models/     persistence
lib/auth/       auth/authorization
lib/validation/ input validation
components/ui/  shared UI primitives
```

Critical business logic belongs in `modules/`.

## Critical Invariants
- `available = stock - reserved`
- `reserved <= stock`
- Inventory mutations use centralized services.
- Critical related mutations use transactions.
- Quotation conversion rechecks live inventory.
- Server is authoritative for financial and inventory values.
- Protected mutations authenticate → authorize → validate → mutate.
- Historical commercial/financial records remain traceable.
- Sensitive mutations are auditable.

## Verification
Before completion:
- Targeted tests pass.
- Type checking passes.
- Failure/rollback paths are checked.
- Bypass paths are checked.
- `pnpm run build` passes.
- `progress-tracker.md` is updated.
- Relevant context is updated if rules/architecture change.

## Protected
Do not modify `components/ui/*`, third-party internals, generated/build files, secrets, or unrelated modules unless required.

## Stop Rule
Implement only the requested specification. After verification and documentation, STOP. Never automatically start the next specification.

## Principle
**Correctness over convenience. Root-cause fixes over patches. Server authority over client calculations. Small verified changes over broad refactors.**