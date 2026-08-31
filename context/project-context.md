# Safety Hub

## Overview

Safety Hub is a PPE commerce and business operations platform for managing a safety-equipment catalog, customer purchases, B2B quotations, orders, invoices, payments, inventory, customers, analytics, and administrative operations. The application provides a public storefront for customers and a protected Sentinel administration portal for staff and administrators. The system must maintain accurate inventory, financial records, commercial document relationships, and auditable operational history.

## Goals

1. Maintain accurate real-time product and variant availability across storefront, cart, checkout, quotations, orders, and inventory operations.
2. Maintain financially consistent relationships between quotations, orders, invoices, and payments.
3. Provide a secure Sentinel administration portal with role-based access and controlled operational mutations.
4. Preserve historical commercial records instead of physically deleting records that participate in business transactions.
5. Provide reliable, testable, maintainable domain services with clear separation between HTTP, business logic, persistence, and presentation.
6. Ensure critical inventory and financial operations are atomic and cannot leave partially completed state.
7. Provide sufficient auditability to determine who performed sensitive operational actions and what changed.

## Core User Flow

### Storefront

1. Customer browses PPE products and categories.
2. Customer selects products or product variants.
3. System calculates current available quantity using inventory rules.
4. Customer adds products to cart.
5. Customer proceeds through checkout.
6. Server revalidates product prices, taxes, variants, and inventory.
7. System creates the order and reserves inventory atomically.
8. Customer receives order confirmation.
9. Staff manages fulfillment through Sentinel.
10. Inventory is converted from reserved to shipped when the order is shipped.

### B2B Quotation

1. Staff creates a quotation for a customer.
2. Product, pricing, tax, and availability information is captured as a quotation snapshot.
3. Quotation may be edited while it is editable.
4. Customer accepts the quotation.
5. System rechecks current inventory.
6. System creates the corresponding order and inventory reservation in one transaction.
7. Quotation becomes immutable/converted according to its lifecycle.
8. Order can subsequently be converted to an invoice.

### Invoice and Payment

1. Staff creates an invoice from an eligible order or creates a permitted invoice directly.
2. Invoice begins in its appropriate draft state.
3. Invoice is issued through the defined lifecycle.
4. Payments are recorded through the payment ledger.
5. Invoice payment status is derived from authoritative payment records.
6. Payments can only be voided through authorized operations.
7. Issued/historical financial documents are never physically deleted.

## Features

### Storefront

* Product catalog
* Categories
* Product variants
* Product availability
* Shopping cart
* Checkout
* Customer account
* Guest orders
* Customer addresses
* Contact form
* Store order tracking

### Sentinel Administration

* Dashboard
* Products
* Categories
* Inventory
* Customers
* Quotations
* B2B orders
* Store orders
* Invoices
* Payments
* Users/staff
* Analytics
* Settings

### Commercial Operations

* Quotations
* Quotation-to-order conversion
* Order lifecycle management
* Order-to-invoice conversion
* Invoice lifecycle
* Payment ledger
* Payment voiding
* Inventory reservations
* Inventory movements

### Security and Governance

* NextAuth authentication
* Sentinel-specific authentication boundary
* Staff/admin authorization
* Session invalidation
* Ownership checks
* Input validation
* Audit logging
* Protected financial operations

## Scope

### In Scope

* Inventory integrity
* Product and variant availability
* Inventory reservations
* Order lifecycle integrity
* Quotation lifecycle integrity
* Quotation-to-order conversion
* Invoice lifecycle integrity
* Payment ledger integrity
* Audit logging
* Authorization for financial mutations
* Automated tests for critical business invariants
* Performance improvements directly related to operational correctness

### Out of Scope

* Rewriting the application from scratch
* Replacing Next.js
* Replacing MongoDB/Mongoose
* Replacing NextAuth
* Replacing the existing UI system
* Redesigning the storefront unless required for correctness
* Introducing unrelated third-party infrastructure
* Adding features that are not required by the current business scope

## Success Criteria

1. Inventory mutations are centralized and no business route directly performs uncontrolled stock/reservation changes.
2. Available inventory is consistently calculated as `stock - reserved`.
3. Simple products and variants follow the same reservation semantics.
4. Quotation-to-order conversion is atomic.
5. Quotation conversion always rechecks current inventory.
6. Concurrent reservations cannot oversell inventory.
7. Shipped and delivered orders cannot have their commercial line items modified.
8. Historical orders cannot be physically deleted.
9. Direct staff-created orders cannot bypass inventory rules.
10. Issued invoices cannot be physically deleted.
11. Invoice payments are represented by an authoritative payment ledger.
12. Payment operations require appropriate authorization.
13. Quotation, order, invoice, and payment relationships cannot be broken by destructive mutations.
14. Sensitive mutations generate audit records.
15. Financial operations fail closed when required financial configuration cannot be loaded.
16. Critical inventory and financial workflows have integration tests.
17. `npm run build` passes before an implementation unit is considered complete.
18. Existing functionality outside the defined scope remains operational.
