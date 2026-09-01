# Spec 04 — Prevent Over-Reservation

## Status
Planned

## Objective
Prevent concurrent operations from reserving more inventory than is actually available.

## Requirements
- Make availability verification atomic with reservation.
- Verify variant-specific inventory.
- Safely handle concurrent reservation attempts.
- Guarantee `reserved <= stock`.
- Prevent negative availability.
- Add concurrency/integration tests.

## Invariants
- `reserved >= 0`
- `reserved <= stock`
- `available = stock - reserved`

## Completion Criteria
The specification is complete only when the requirements and invariants are verified, tests pass, and `progress-tracker.md` is updated.