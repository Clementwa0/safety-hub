# Spec 11 — Fail Closed on Financial Settings

## Objective
Prevent financial mutations from silently using unsafe fallback settings.

## Requirements
- Identify required financial settings.
- Separate display defaults from mutation behavior.
- Fail safely when required settings cannot load.
- Add failure tests.

## Done When
Financial mutations cannot succeed with missing required settings; tests/build pass.
