# Spec 07 - Protect Direct Order Creation

## Objective
Ensure staff-created orders cannot bypass inventory rules.

## Requirements
- Find every direct order path.
- Use the authoritative inventory service.
- Validate current availability server-side.
- Check Sentinel and alternate endpoints.
- Add success/failure tests.

## Open Question
Confirm whether direct staff orders reserve immediately if existing behavior does not define this.

## Done When
All direct paths obey inventory invariants; tests/build pass; tracker is updated.
