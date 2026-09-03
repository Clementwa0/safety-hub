# Spec 05 - Protect Shipped Orders

## Objective
Prevent shipped/delivered orders from changing commercial line items.

## Requirements
- Reject item, quantity, product, and variant changes server-side.
- Keep UI consistent with the server rule.
- Preserve valid pre-shipment behavior.
- Add lifecycle tests.

## Done When
Invalid edits fail, valid behavior remains, tests/build pass, and tracker is updated.
