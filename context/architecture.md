# Architecture

## Stack
Next.js 16 · TypeScript · React 19 · Tailwind CSS 4 · shadcn/ui/Base UI · Zustand/React state · React Hook Form/Zod · NextAuth · MongoDB/Mongoose · Cloudinary · Nodemailer · Recharts · @react-pdf/renderer

## Boundaries
| Area | Owns |
|---|---|
| `app/` | Routes, layouts, HTTP |
| `features/` | UI and presentation |
| `modules/` | Domain/business logic |
| `services/` | API/application wrappers |
| `lib/models/` | Persistence |
| `lib/auth/` | Authentication/authorization |
| `lib/validation/` | Input validation |
| `components/ui/` | Shared UI primitives |

Routes stay thin. Critical business logic belongs in `modules/`.

## Storage
MongoDB stores business data, relationships, inventory, payments, settings, and audit records.

Cloudinary stores large media; MongoDB stores references and metadata.

## Auth
Customers use customer authentication. Staff/admin use Sentinel. Protected mutations require server-side authentication, authorization, and ownership checks where applicable.

## Inventory
```text
available = stock - reserved
stock >= 0
reserved >= 0
reserved <= stock
```

Reservations must be atomic where concurrency matters. Quotation snapshots never replace live inventory checks.

## Commercial Flow
```text
Quotation → Order → Invoice → Payment
```

Preserve existing lifecycle statuses unless a specification explicitly changes them.

## Invariants
1. Inventory mutations use centralized services.
2. Availability is `stock - reserved`.
3. Reservations cannot oversell.
4. Quotation conversion rechecks live inventory and is transactional.
5. Variants remain independent.
6. Shipped/delivered order lines are immutable.
7. Historical orders and issued invoices are not physically deleted.
8. Direct orders cannot bypass inventory rules.
9. Payment records are the authoritative payment ledger.
10. Commercial documents remain traceable.
11. Financial configuration failures fail closed.
12. Client financial/inventory values are never authoritative.
13. Sensitive mutations are auditable.
14. Critical related mutations use transactions.
