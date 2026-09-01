# Spec 12 — Payment Authorization

## Objective
Enforce server-side authorization for sensitive payment operations.

## Requirements
- Define who may record payments.
- Define who may void payments.
- Protect relevant invoice-state changes.
- Enforce server-side.
- Audit sensitive operations.
- Add authorization tests.

## Open Question
Resolve exact staff permissions if not already defined.

## Done When
Unauthorized operations fail, authorized operations work, tests/build pass.
