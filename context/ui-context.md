# UI Context

## Design
Clean, professional PPE commerce/admin interface. Keep storefront and Sentinel visually consistent.

## Stack
Tailwind CSS 4 · shadcn/ui/Base UI · Lucide icons · existing design tokens.

## Rules
- Reuse existing components and tokens.
- Avoid hardcoded colors when tokens exist.
- Do not create a separate visual language for one feature.
- Preserve responsive patterns.
- Keep business logic out of UI.
- Do not modify `components/ui/*` unless required.

## Layout
- Storefront: clear catalog, cart, and checkout.
- Sentinel: consistent sidebar, header, tables, forms, and responsive layouts.
- Reuse existing dialog, form, table, and feedback patterns.

## Scope
UI changes must support the active specification. Avoid unrelated redesigns.
