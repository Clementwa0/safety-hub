# Spec 10 - Add Audit Trail

## Objective
Create an authoritative audit trail for sensitive operations.

## Requirements
- Implement/reuse an audit service and model.
- Record actor, action, entity, timestamp, and relevant metadata.
- Audit sensitive inventory, order, quotation, invoice, payment, user, and settings mutations as required.
- Keep audit logic out of UI.
- Add tests.

## Open Question
Confirm which reservation/release events need separate audit records versus inventory movement history.

## Done When
Required operations are auditable; tests/build pass.
