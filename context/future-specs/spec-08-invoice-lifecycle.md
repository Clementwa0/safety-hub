# Spec 08 — Protect Invoice Lifecycle

## Objective
Prevent invalid or destructive invoice lifecycle changes.

## Requirements
- Validate state transitions.
- Protect issued/historical invoices.
- Preserve valid draft behavior.
- Prevent arbitrary financial-total changes.
- Add lifecycle tests.

## Done When
Valid transitions work, invalid/destructive changes fail, tests/build pass, and tracker is updated.
