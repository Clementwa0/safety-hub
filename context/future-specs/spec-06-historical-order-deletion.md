# Spec 06 — Protect Historical Orders

## Objective
Prevent destructive deletion of historically relevant orders.

## Requirements
- Identify protected states from existing behavior.
- Reject deletion of protected orders.
- Preserve valid lifecycle behavior.
- Add tests.

## Open Question
Resolve exact deletable states if the current system does not define them.

## Done When
Protection is server-side, tested, build passes, and tracker is updated.
