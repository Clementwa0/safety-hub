# AI Workflow

## Process
1. Read relevant context.
2. Read the selected specification.
3. Analyze existing code.
4. Identify affected paths, invariants, and bypasses.
5. Plan the smallest correct change.
6. Implement only the selected specification.
7. Test success and failure paths.
8. Check bypass paths.
9. Run type checking.
10. Run `pnpm run build`.
11. Update `progress-tracker.md`.
12. Stop.

## Rules
- Do not invent business policy.
- Inspect existing code/tests before deciding behavior.
- Record unresolved ambiguity in `progress-tracker.md`.
- Avoid unrelated refactors.
- Update architecture/context only when rules or decisions change.

## Scope
If work cannot be verified independently, split it.

Never implement the next specification automatically.
