# Architecture Context

## Stack

| Layer      | Technology                    | Role                                                    |
| ---------- | ----------------------------- | ------------------------------------------------------- |
| Framework  | Next.js 16 App Router         | Application framework, routing, server/client rendering |
| Language   | TypeScript                    | Application language                                    |
| UI         | React 19                      | User interface                                          |
| Styling    | Tailwind CSS 4                | Styling and design system                               |
| Components | shadcn/ui / Base UI           | Reusable UI primitives                                  |
| State      | Zustand / React state         | Client-side application state                           |
| Forms      | React Hook Form + Zod         | Form state and validation                               |
| Auth       | NextAuth                      | Authentication and session management                   |
| Database   | MongoDB                       | Persistent application data                             |
| ODM        | Mongoose                      | Schema/model/persistence layer                          |
| Media      | Cloudinary                    | Product/media storage                                   |
| Email      | Nodemailer                    | Transactional/contact email                             |
| Charts     | Recharts                      | Analytics visualization                                 |
| Documents  | `@react-pdf/renderer`         | PDF generation                                          |
| Testing    | Existing project test tooling | Unit/integration verification                           |

## System Boundaries

### `app/`

Owns:

* Next.js routes
* App Router layouts
* Route handlers
* Server/client composition
* HTTP request/response boundaries

Route handlers must remain thin and must not become the primary location for domain business logic.

### `features/`

Owns:

* Feature-specific UI
* Feature-specific hooks
* Feature-specific client interactions
* Sentinel and storefront presentation logic

Features must not directly implement critical database invariants.

### `modules/`

Owns:

* Domain/business logic
* Inventory rules
* Order lifecycle
* Quotation lifecycle
* Invoice lifecycle
* Payment rules
* Checkout logic
* Analytics rules
* Cross-feature business operations

Critical mutations belong here.

### `services/`

Owns:

* Client-facing API service wrappers
* Reusable application service boundaries
* Sentinel/storefront API interaction

Services must not duplicate domain rules already defined in `modules/`.

### `lib/models/`

Owns:

* Mongoose models
* Schema definitions
* Database-level indexes
* Persistence-specific behavior

Database models must not become substitutes for application/domain services.

### `lib/auth/`

Owns:

* Authentication configuration
* Session handling
* Authorization helpers
* Staff/admin/customer access checks
* Sentinel authentication behavior

### `lib/validation/`

Owns:

* Zod schemas
* Request DTO validation
* Shared input validation

### `components/ui/`

Owns:

* Reusable UI primitives
* shadcn/Base UI components

Do not modify generated/third-party UI primitives unless explicitly required.

## Storage Model

### Database

MongoDB stores:

* Users
* Customers
* Products
* Product variants
* Categories
* Orders
* Store orders
* Quotations
* Invoices
* Payments
* Inventory state
* Inventory movements
* Addresses
* Settings
* Audit logs
* Operational metadata
* Relationships between commercial documents

### Cloudinary

Cloudinary stores:

* Product images
* Uploaded media
* Other large media artifacts

The database stores metadata and references to media rather than large binary content.

## Auth and Access Model

* Customers authenticate through the customer authentication flow.
* Staff and administrators authenticate through the Sentinel authentication boundary.
* Sentinel routes require authenticated staff/admin access.
* Administrative capabilities are determined by role and authorization helpers.
* Authentication must be checked before protected mutations.
* Ownership must be checked before customer-owned resource mutations.
* Authorization must occur before executing a mutation.
* Client-provided role/permission information must never be trusted as authoritative.
* Sensitive financial and inventory operations must require explicit staff authorization.

## Domain Model

### Inventory

Inventory semantics:

```text
stock     = physical quantity currently on hand
reserved  = quantity committed to active orders but not yet shipped
available = stock - reserved
```

For every product and variant:

```text
available >= 0
reserved >= 0
stock >= 0
reserved <= stock
```

Inventory must be mutated through centralized inventory services.

### Reservation Lifecycle

```text
Available
    ↓
Reserve
    ↓
Reserved
    ↓
Ship
    ↓
Physical stock decreases
Reserved decreases
```

Cancellation before shipment:

```text
Reserved
    ↓
Release reservation
    ↓
Available
```

### Commercial Lifecycle

```text
Quotation
    ↓
Accepted
    ↓
Converted to Order
    ↓
Order Fulfillment
    ↓
Invoice
    ↓
Payments
```

The exact existing statuses must be preserved unless a status change is explicitly required.

## Invariants

1. Inventory mutations must occur through centralized inventory/domain services.
2. No route handler may directly mutate `stock` or `reserved` as business logic.
3. `available = stock - reserved`.
4. `reserved` must never exceed `stock`.
5. Inventory reservations must be atomic.
6. Concurrent reservations must not oversell inventory.
7. Quotation-to-order conversion must be transactional.
8. Quotation conversion must recheck current inventory rather than trusting historical availability snapshots.
9. Product variants must be handled independently; one variant must never overwrite another during availability calculation.
10. Simple products must use the same `stock - reserved` availability semantics as variants.
11. Shipped and delivered order line items are immutable.
12. Historical orders must not be physically deleted.
13. Direct staff-created orders must follow the same inventory rules as other order creation paths.
14. Issued invoices must not be physically deleted.
15. Invoice payment totals must be derived from authoritative payment records.
16. Payments cannot be modified through arbitrary invoice updates.
17. Voiding a payment must be an authorized, auditable operation.
18. Converted quotations must not be deleted while referenced by an order.
19. Products with historical commercial references should be archived rather than physically deleted.
20. Customers with historical commercial references should be archived rather than physically deleted.
21. Categories with dependent products must not be destructively deleted.
22. Financial configuration failures must fail closed during financial operations.
23. Client-provided financial totals, payment status, stock, reserved quantity, or amount-paid values are never authoritative.
24. Critical mutations must occur inside MongoDB transactions when multiple related records must remain consistent.
25. Sensitive mutations must generate audit records.
26. API handlers must validate input before executing business logic.
27. Authorization must occur before mutations.
28. Domain rules must not be duplicated across multiple API routes.
29. Historical financial and inventory records must remain traceable.
30. No implementation may intentionally weaken an existing security or accounting invariant to make a feature easier to implement.
