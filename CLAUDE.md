Yes. I analyzed the actual `safety-hub-styled.zip` against the architecture you proposed.

The important thing is **not to blindly move every existing folder into the new tree**. Some existing folders have the right responsibility but the wrong location; others should stay exactly where they are.

I would make the architecture **domain-first**, with this rule:

> `app/` = routes only
> `features/` = UI/page composition for a user-facing feature
> `modules/` = server-side business/domain logic
> `components/` = reusable UI that does not belong to one specific feature
> `client/` = browser → API clients
> `lib/` = technical infrastructure/shared primitives
> `hooks/` = reusable React hooks
> `store/` = client state
> `types/` = cross-module TypeScript contracts
> `tests/` = tests mirroring the architecture

---

# 1. The final structure I recommend

For your actual project, I would slightly refine the structure you proposed:

```text
project/
├── app/
│   ├── (public)/
│   ├── (admin)/
│   ├── (auth)/
│   ├── api/
│   ├── globals.css
│   ├── layout.tsx
│   └── favicon.ico
│
├── features/
│   ├── storefront/
│   │   ├── home/
│   │   ├── catalog/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── account/
│   │   ├── contact/
│   │   └── marketing/
│   │
│   └── sentinel/
│       ├── dashboard/
│       ├── products/
│       ├── categories/
│       ├── orders/
│       ├── store-orders/
│       ├── quotations/
│       ├── invoices/
│       ├── payments/
│       ├── sales/
│       ├── users/
│       ├── contact-messages/
│       ├── settings/
│       ├── banners/
│       └── testimonials/
│
├── modules/
│   ├── identity/
│   ├── catalog/
│   ├── customers/
│   ├── cart/
│   ├── checkout/
│   ├── inventory/
│   ├── orders/
│   ├── quotations/
│   ├── invoicing/
│   ├── payments/
│   ├── notifications/
│   ├── contact/
│   ├── settings/
│   └── analytics/
│
├── components/
│   ├── ui/
│   ├── shared/
│   ├── storefront/
│   └── sentinel/
│
├── client/
│   ├── storefront/
│   ├── sentinel/
│   └── shared/
│
├── lib/
│   ├── auth/
│   ├── db/
│   ├── cloudinary/
│   ├── config/
│   ├── validation/
│   ├── formatting/
│   ├── http/
│   └── utilities/
│
├── hooks/
├── store/
├── types/
├── tests/
└── scripts/
```

The biggest change from your original proposal is that I would **not force every business concern into only the modules you originally listed**.

Your actual application has:

* categories
* contact messages
* settings
* banners
* testimonials
* analytics

so those deserve explicit ownership.

---

# 2. Most important rule: `app/` should become thin

For example, this:

```text
app/(admin)/sentinel/products/page.tsx
```

should remain there.

But its job should be approximately:

```tsx
import { ProductsPage } from "@/features/sentinel/products";

export default function Page() {
  return <ProductsPage />;
}
```

Not:

```text
route
 ├── fetch data
 ├── validation
 ├── business rules
 ├── database operations
 ├── calculations
 └── UI
```

Think:

```text
app
 ↓
features
 ↓
modules
 ↓
database/external services
```

---

# 3. APP ROUTES — DO NOT MOVE THEM

These should remain under `app/`.

## Public routes

```text
app/(public)/
├── about/page.tsx
├── account/
├── cart/page.tsx
├── categories/
├── checkout/
├── contact/page.tsx
├── featured/page.tsx
├── new-arrivals/page.tsx
├── page.tsx
├── products/
├── search/page.tsx
├── services/page.tsx
├── shop/
├── privacy-policy/page.tsx
└── terms/page.tsx
```

### Their feature destinations

| Existing route               | Feature                                       |
| ---------------------------- | --------------------------------------------- |
| `(public)/page.tsx`          | `features/storefront/home/`                   |
| `about/page.tsx`             | `features/storefront/marketing/about/`        |
| `contact/page.tsx`           | `features/storefront/contact/`                |
| `services/page.tsx`          | `features/storefront/marketing/services/`     |
| `featured/page.tsx`          | `features/storefront/catalog/featured/`       |
| `new-arrivals/page.tsx`      | `features/storefront/catalog/new-arrivals/`   |
| `products/page.tsx`          | `features/storefront/catalog/products/`       |
| `products/[slug]/page.tsx`   | `features/storefront/catalog/product-detail/` |
| `categories/page.tsx`        | `features/storefront/catalog/categories/`     |
| `categories/[slug]/page.tsx` | `features/storefront/catalog/category/`       |
| `shop/page.tsx`              | `features/storefront/catalog/shop/`           |
| `search/page.tsx`            | `features/storefront/catalog/search/`         |
| `cart/page.tsx`              | `features/storefront/cart/`                   |
| `checkout/page.tsx`          | `features/storefront/checkout/`               |
| `checkout/success/page.tsx`  | `features/storefront/checkout/`               |
| `account/**`                 | `features/storefront/account/`                |

---

# 4. Auth routes

Keep:

```text
app/(auth)/
├── layout.tsx
└── login/page.tsx
```

But the actual login UI belongs in:

```text
features/sentinel/auth/
```

You currently have:

```text
features/sentinel/auth/pages/LoginPage.tsx
```

Keep that idea.

I would simplify it to:

```text
features/
└── sentinel/
    └── auth/
        ├── LoginPage.tsx
        └── index.ts
```

You don't need `pages/` inside every feature.

---

# 5. Sentinel routes

Keep all these in:

```text
app/(admin)/sentinel/
```

but move their UI into corresponding feature folders.

### Dashboard

```text
app/(admin)/sentinel/dashboard/page.tsx
        ↓
features/sentinel/dashboard/
```

### Products

```text
app/(admin)/sentinel/products/
        ↓
features/sentinel/products/
```

### Categories

```text
app/(admin)/sentinel/categories/
        ↓
features/sentinel/categories/
```

### Orders

```text
app/(admin)/sentinel/orders/
        ↓
features/sentinel/orders/
```

### Store orders

```text
app/(admin)/sentinel/store-orders/
        ↓
features/sentinel/store-orders/
```

### Quotations

```text
app/(admin)/sentinel/quotations/
        ↓
features/sentinel/quotations/
```

### Invoices

```text
app/(admin)/sentinel/invoices/
        ↓
features/sentinel/invoices/
```

### Sales

```text
app/(admin)/sentinel/sales/
        ↓
features/sentinel/sales/
```

### Users

```text
app/(admin)/sentinel/users/
        ↓
features/sentinel/users/
```

### Contact messages

```text
app/(admin)/sentinel/contact-messages/
        ↓
features/sentinel/contact-messages/
```

### Settings

```text
app/(admin)/sentinel/settings/
        ↓
features/sentinel/settings/
```

### Profile

```text
app/(admin)/sentinel/profile/
        ↓
features/sentinel/profile/
```

### Banners

```text
app/(admin)/sentinel/banners/
        ↓
features/sentinel/banners/
```

### Testimonials

```text
app/(admin)/sentinel/testimonials/
        ↓
features/sentinel/testimonials/
```

---

# 6. API routes — DO NOT MOVE OUT OF `app/api`

This is important.

Keep:

```text
app/api/
```

because Next.js App Router expects route handlers there.

But the route handler should become thin.

For example:

```text
app/api/checkout/route.ts
```

should call:

```text
modules/checkout/application/checkout.ts
```

rather than containing the entire checkout implementation.

---

# 7. API route → module mapping

Here is the actual mapping I recommend.

## Account

```text
app/api/account/addresses/
    ↓
modules/customers/

app/api/account/me/
    ↓
modules/identity/

app/api/account/overview/
    ↓
modules/customers/

app/api/account/link-guest-orders/
    ↓
modules/orders/
```

---

## Auth

```text
app/api/auth/[...nextauth]/route.ts
    ↓
lib/auth/

app/api/auth/register/route.ts
    ↓
modules/identity/
```

---

## Cart

```text
app/api/cart/
app/api/cart/items/
    ↓
modules/cart/
```

---

## Checkout

```text
app/api/checkout/route.ts
    ↓
modules/checkout/
```

This is one of the most important boundaries.

---

## Categories

```text
app/api/categories/
    ↓
modules/catalog/
```

---

## Products

```text
app/api/products/
    ↓
modules/catalog/

app/api/products/availability/
    ↓
modules/inventory/

app/api/products/[id]/duplicate/
    ↓
modules/catalog/

app/api/products/bulk/
    ↓
modules/catalog/
```

---

## Store orders

```text
app/api/store-orders/
    ↓
modules/orders/

app/api/admin/store-orders/
    ↓
modules/orders/
```

Don't create a separate `store-orders` module.

`StoreOrder` is a different **workflow/model**, but it still belongs to the Orders domain.

---

# 8. B2B order APIs

```text
app/api/orders/
    ↓
modules/orders/
```

And:

```text
app/api/orders/[id]/convert-to-invoice/
    ↓
modules/invoicing/
```

The conversion operation is an **invoicing use case**, even though it starts from an order.

---

# 9. Quotations

```text
app/api/quotations/
    ↓
modules/quotations/
```

---

# 10. Invoices

```text
app/api/invoices/
    ↓
modules/invoicing/
```

But:

```text
app/api/invoices/[id]/payments/
    ↓
modules/payments/
```

That separation is important.

---

# 11. Customers

```text
app/api/customers/
    ↓
modules/customers/
```

---

# 12. Users

```text
app/api/users/
    ↓
modules/identity/
```

Because Sentinel users are identities/roles rather than a separate business domain.

---

# 13. Sales dashboard

```text
app/api/sales-dashboard/
    ↓
modules/analytics/
```

I would move:

```text
lib/server/sales-dashboard.ts
```

into:

```text
modules/analytics/
```

eventually.

---

# 14. Contact messages

```text
app/api/contact-messages/
    ↓
modules/contact/
```

And:

```text
app/api/contact/route.ts
    ↓
modules/contact/
```

---

# 15. Settings

```text
app/api/settings/
    ↓
modules/settings/
```

---

# 16. Cron

Keep:

```text
app/api/cron/abandoned-carts/route.ts
```

but it should call:

```text
modules/notifications/
```

or:

```text
modules/cart/
```

depending on the exact operation.

I would use:

```text
modules/cart/application/process-abandoned-carts.ts
```

and have that call the notification module.

---

# 17. COMPONENTS — this is where the biggest cleanup happens

Your current:

```text
components/
```

mixes:

* feature-specific components
* global components
* Sentinel components
* storefront components
* technical UI

We should separate these.

---

# 18. `components/ui` → STAY

Everything here stays:

```text
components/ui/
├── avatar.tsx
├── badge.tsx
├── button.tsx
├── card.tsx
├── checkbox.tsx
├── command.tsx
├── dialog.tsx
├── dropdown-menu.tsx
├── input-group.tsx
├── input.tsx
├── label.tsx
├── radio-group.tsx
├── scroll-area.tsx
├── select.tsx
├── separator.tsx
├── sheet.tsx
├── sidebar.tsx
├── skeleton.tsx
├── slider.tsx
├── sonner.tsx
├── switch.tsx
├── table.tsx
├── tabs.tsx
└── textarea.tsx
```

These are infrastructure UI primitives.

Do not move them into features.

---

# 19. Shared components → STAY

These are genuinely reusable:

```text
components/shared/
├── ConfirmDialog.tsx
├── EmptyState.tsx
├── Loading.tsx
├── LoadingSkeleton.tsx
├── PageHeader.tsx
├── Pagination.tsx
├── QuantitySelector.tsx
├── RatingStars.tsx
├── SafeImage.tsx
└── ...
```

Keep these under:

```text
components/shared/
```

### But move ProductCard

You have:

```text
components/shared/ProductCard.tsx
components/products/components/Product-Card.tsx
```

Consolidate them.

I recommend:

```text
components/storefront/ProductCard.tsx
```

if it is used across many storefront features.

---

# 20. CloudinaryImageField

Current:

```text
components/shared/CloudinaryImageField.tsx
```

Keep:

```text
components/shared/
```

because it is a reusable UI control.

The actual Cloudinary implementation remains:

```text
lib/cloudinary/
```

---

# 21. WhatsAppFab

Current:

```text
components/shared/WhatsAppFab.tsx
```

Keep there.

The WhatsApp business logic:

```text
lib/whatsapp/
```

should eventually move to:

```text
modules/notifications/whatsapp/
```

if WhatsApp becomes a substantial business integration.

For now `lib/whatsapp` is acceptable.

---

# 22. Storefront common components

Current:

```text
components/common/storefront/
```

should become:

```text
components/storefront/
```

Move:

```text
Footer.tsx
SearchOverlay.tsx
TopStripe.tsx
links.ts
index.tsx
```

there.

And:

```text
components/common/storefront/navbar/
```

becomes:

```text
components/storefront/navbar/
```

So:

```text
components/
└── storefront/
    ├── Footer.tsx
    ├── SearchOverlay.tsx
    ├── TopStripe.tsx
    ├── links.ts
    └── navbar/
        ├── DesktopNav.tsx
        ├── MobileNav.tsx
        └── Navbar.tsx
```

---

# 23. Sentinel common components

Current:

```text
components/common/sentinel/
```

should become:

```text
components/sentinel/
```

Move:

```text
header/
sidebar/
```

there.

So:

```text
components/sentinel/
├── header/
│   ├── Breadcrumbs.tsx
│   ├── Header.tsx
│   ├── MessagesShortcut.tsx
│   ├── Notifications.tsx
│   ├── ThemeToggle.tsx
│   ├── UserMenu.tsx
│   └── index.ts
│
└── sidebar/
    ├── Sidebar.tsx
    ├── SidebarGroup.tsx
    ├── SidebarItem.tsx
    ├── navigation.ts
    └── index.ts
```

These are Sentinel-wide components, not dashboard-specific components.

---

# 24. Account components

Current:

```text
components/account/
```

Move to:

```text
features/storefront/account/components/
```

Everything:

```text
AccountAddresses.tsx
AccountMenu.tsx
AccountOrderDetailPage.tsx
AccountOrders.tsx
AccountOverviewPage.tsx
AccountProfile.tsx
AccountSidebar.tsx
AccountSummaryCard.tsx
AddressFormDialog.tsx
OrderStatusBadge.tsx
RecentOrders.tsx
```

belongs to the account feature.

This is exactly the kind of UI that should not be global.

---

# 25. Cart components

Current:

```text
components/cart/
```

Move to:

```text
features/storefront/cart/components/
```

Including:

```text
CartDrawer.tsx
CartIcon.tsx
CartItem.tsx
CartPage.tsx
CartSummary.tsx
EmptyCart.tsx
WhatsAppOrderDialog.tsx
```

---

# 26. Checkout components

Current:

```text
components/checkout/
```

Move to:

```text
features/storefront/checkout/components/
```

Including:

```text
CheckoutPage.tsx
CheckoutSuccessPage.tsx
MpesaPaymentCard.tsx
OrderProgressTracker.tsx
SaveOrderPrompt.tsx
StoreOrderStatusBadge.tsx
```

---

# 27. Category components

Current:

```text
components/category/
```

Move to:

```text
features/storefront/catalog/categories/components/
```

Everything:

```text
CategoriesCTA
CategoriesHeader
CategoryCard
CategoryGrid
CategoryHero
CategoryProductsSection
CategoryStats
```

belongs there.

---

# 28. Home components

Current:

```text
components/home/
```

Move to:

```text
features/storefront/home/components/
```

So:

```text
features/storefront/home/
├── HomePage.tsx
└── components/
    ├── CTA.tsx
    ├── Categories.tsx
    ├── FeaturedProducts.tsx
    ├── Hero.tsx
    └── NewArrivals.tsx
```

Your existing:

```text
features/storefront/home/pages/HomePage.tsx
```

can become simply:

```text
features/storefront/home/HomePage.tsx
```

---

# 29. Contact components

Current:

```text
components/contact/
```

Move to:

```text
features/storefront/contact/
```

Structure:

```text
features/storefront/contact/
├── ContactPage.tsx
├── ContactForm.tsx
├── ContactHero.tsx
├── ContactInfoCards.tsx
├── GoogleMap.tsx
├── Newsletter.tsx
└── contact-data.ts
```

`contact-data.ts` is feature data, so it does not belong in `lib`.

---

# 30. Products storefront components

Current:

```text
components/products/
```

should be split.

### Listing

```text
components/products/components/ProductFilters.tsx
components/products/components/ProductFiltersGroup.tsx
components/products/components/ProductGrid.tsx
components/products/components/ProductSearch.tsx
components/products/components/ProductTabs.tsx
```

Move to:

```text
features/storefront/catalog/products/components/
```

### Product detail

```text
components/products/product-detail/
```

move to:

```text
features/storefront/catalog/product-detail/components/
```

So:

```text
features/storefront/catalog/
├── products/
│   ├── ProductsPage.tsx
│   └── components/
│       ├── ProductFilters.tsx
│       ├── ProductFiltersGroup.tsx
│       ├── ProductGrid.tsx
│       ├── ProductSearch.tsx
│       └── ProductTabs.tsx
│
└── product-detail/
    ├── ProductPage.tsx
    └── components/
        ├── ProductActions.tsx
        ├── ProductGallery.tsx
        ├── ProductHeader.tsx
        ├── ProductNotFound.tsx
        ├── ProductPricing.tsx
        ├── ProductRelated.tsx
        ├── ProductSkeleton.tsx
        ├── ProductTabs.tsx
        └── ProductTrustBadges.tsx
```

---

# 31. Shop components

Current:

```text
components/shop/
```

Move to:

```text
features/storefront/catalog/shop/components/
```

Everything belongs there:

```text
FilterOptionList
FilterSection
MobileFilters
PriceFilter
ShopContent
ShopSidebar
ShopToolbar
```

---

# 32. Sentinel product components

Current:

```text
components/sentinel/product/
```

Move to:

```text
features/sentinel/products/components/
```

Including:

```text
ProductForm.tsx
ProductTable.tsx
components/
    AdditionalInfoSection
    BasicInfoSection
    BulkActionsBar
    DetailsSection
    FieldError
    ImagesSection
    InventorySection
    OptionsSection
    PricingSection
    ProductFilters
```

These are clearly Sentinel product feature components.

---

# 33. Sentinel category components

Current:

```text
components/sentinel/CategoryForm.tsx
components/sentinel/CategoryTable.tsx
```

Move:

```text
features/sentinel/categories/components/
```

---

# 34. Sentinel dashboard

Current:

```text
components/sentinel/dashboard/
```

Move:

```text
features/sentinel/dashboard/components/
```

Most files belong there:

```text
Dashboard.tsx
categoryVisuals.ts
format.ts
widgets/
```

### BUT:

```text
computeDashboardData.ts
```

should **NOT** stay as a UI component.

Move it to:

```text
modules/analytics/
```

or eliminate it if `lib/server/sales-dashboard.ts` becomes authoritative.

This is important.

---

# 35. Sentinel sales dashboard

Current:

```text
components/sentinel/sales-dashboard/
```

Move:

```text
features/sentinel/sales/components/dashboard/
```

or:

```text
features/sentinel/sales-dashboard/
```

I prefer:

```text
features/sentinel/sales/
├── SalesPage.tsx
├── components/
│   ├── SalesDashboard.tsx
│   ├── KpiCard.tsx
│   ├── OrdersBreakdownCharts.tsx
│   ├── RevenueTrendChart.tsx
│   ├── SalesPipeline.tsx
│   └── SecondaryBreakdownCards.tsx
```

because sales dashboard is a part of the Sentinel sales feature.

---

# 36. Sentinel order components

Current:

```text
components/sentinel/orders/
```

→

```text
features/sentinel/orders/components/
```

Move:

```text
OrderForm.tsx
OrderTable.tsx
```

---

# 37. Sentinel quotation components

Current:

```text
components/sentinel/quotations/
```

→

```text
features/sentinel/quotations/components/
```

---

# 38. Sentinel invoice components

Current:

```text
components/sentinel/invoices/
```

→

```text
features/sentinel/invoices/components/
```

---

# 39. Sentinel sales components

Current:

```text
components/sentinel/sales/
```

→

```text
features/sentinel/sales/components/
```

Including:

```text
CustomerFields
DocumentPreview
FulfillmentBadge
LineItemsEditor
PaymentHistoryList
RecordPaymentDialog
StatusBadge
StockAvailabilityPanel
```

---

# 40. Sentinel store-order components

Current:

```text
components/sentinel/store-orders/
```

→

```text
features/sentinel/store-orders/components/
```

---

# 41. Sentinel contact-message components

Current:

```text
components/sentinel/contact-messages/
```

→

```text
features/sentinel/contact-messages/components/
```

---

# 42. Sentinel top-level components

These:

```text
components/sentinel/
├── Login.tsx
├── SettingsForm.tsx
├── StatsCard.tsx
├── UserForm.tsx
└── UserTable.tsx
```

should be split according to domain:

```text
Login.tsx
→ features/sentinel/auth/

SettingsForm.tsx
→ features/sentinel/settings/

StatsCard.tsx
→ features/sentinel/dashboard/components/

UserForm.tsx
→ features/sentinel/users/components/

UserTable.tsx
→ features/sentinel/users/components/
```

---

# 43. Layout components

Current:

```text
components/layouts/
```

I would actually **remove this folder**.

These are layout components:

```text
AuthLayout.tsx
PublicLayout.tsx
SentinelLayout.tsx
```

But your actual Next.js architecture already has:

```text
app/(auth)/layout.tsx
app/(public)/layout.tsx
app/(admin)/sentinel/layout.tsx
```

So having both:

```text
app/.../layout.tsx
```

and:

```text
components/layouts/*.tsx
```

creates unnecessary duplication.

### Recommendation

Keep the actual layouts inside `app`.

Delete the old `components/layouts` layer unless those components contain genuinely reusable layout primitives.

---

# 44. Providers

Keep:

```text
components/providers/
```

because:

```text
CustomerSessionProvider.tsx
ThemeProvider.tsx
```

are application-level React providers.

---

# 45. `features/` — how the existing files should change

You currently have:

```text
features/catalog/
features/sentinel/
features/storefront/
```

I would normalize this.

## Current catalog

```text
features/catalog/
├── categories/
└── products/
```

Move under storefront:

```text
features/storefront/catalog/
```

because these are storefront presentation features.

The **server catalog domain** is separate:

```text
modules/catalog/
```

This distinction is important:

```text
features/storefront/catalog
        ↓
UI

modules/catalog
        ↓
business/data logic
```

---

# 46. Existing feature files

### Current

```text
features/catalog/categories/CategoriesPage.tsx
```

→

```text
features/storefront/catalog/categories/CategoriesPage.tsx
```

### Current

```text
features/catalog/categories/constants.ts
```

→

```text
features/storefront/catalog/categories/constants.ts
```

### Current

```text
features/catalog/categories/index.ts
```

→

```text
features/storefront/catalog/categories/index.ts
```

### Current

```text
features/catalog/categories/pages/CategoryPage.tsx
```

→

```text
features/storefront/catalog/category/CategoryPage.tsx
```

Notice singular `category` because it is the detail page.

---

# 47. Existing ProductsPage

```text
features/catalog/products/ProductsPage.tsx
```

→

```text
features/storefront/catalog/products/ProductsPage.tsx
```

But:

```text
features/catalog/products/pages/ProductPage.tsx
```

should be consolidated with the product-detail route/component.

You currently have two product-detail implementations.

**Do not keep both.**

---

# 48. Existing Sentinel features

These are already in the right conceptual location:

```text
features/sentinel/auth/
features/sentinel/dashboard/
features/sentinel/settings/
```

Keep them and expand them.

For example:

```text
features/sentinel/dashboard/
├── DashboardPage.tsx
├── components/
└── index.ts
```

---

# 49. MODULES — this is where server logic goes

This is the biggest architectural distinction.

Do **not** put React components in `modules`.

A module should contain things like:

```text
application/
domain/
infrastructure/
schemas/
```

where justified.

Don't create all these subfolders if there is only one file.

---

# 50. `lib/models` → modules

This is one of the largest moves.

Current:

```text
lib/models/
├── Address.ts
├── Cart.ts
├── Category.ts
├── ContactMessage.ts
├── Counter.ts
├── Customer.ts
├── Invoice.ts
├── Order.ts
├── Payment.ts
├── Product.ts
├── Quotation.ts
├── Settings.ts
├── StoreOrder.ts
└── StorefrontCustomer.ts
```

I would move them according to domain.

---

## Product

```text
lib/models/Product.ts
```

→

```text
modules/catalog/infrastructure/Product.model.ts
```

---

## Category

```text
lib/models/Category.ts
```

→

```text
modules/catalog/infrastructure/Category.model.ts
```

---

## Cart

```text
lib/models/Cart.ts
```

→

```text
modules/cart/infrastructure/Cart.model.ts
```

---

## Address

```text
lib/models/Address.ts
```

→

```text
modules/customers/infrastructure/Address.model.ts
```

---

## Customer

```text
lib/models/Customer.ts
```

→

```text
modules/customers/infrastructure/Customer.model.ts
```

---

## StorefrontCustomer

This one belongs to identity/customer.

I recommend:

```text
lib/models/StorefrontCustomer.ts
```

→

```text
modules/identity/infrastructure/StorefrontCustomer.model.ts
```

or, if you consider it purely customer-domain data:

```text
modules/customers/infrastructure/StorefrontCustomer.model.ts
```

I prefer **identity** because this model participates heavily in authentication/account linking.

---

# 51. Order models

```text
lib/models/Order.ts
```

→

```text
modules/orders/infrastructure/Order.model.ts
```

```text
lib/models/StoreOrder.ts
```

→

```text
modules/orders/infrastructure/StoreOrder.model.ts
```

Again:

**Do not combine them.**

---

# 52. Quotation

```text
lib/models/Quotation.ts
```

→

```text
modules/quotations/infrastructure/Quotation.model.ts
```

---

# 53. Invoice

```text
lib/models/Invoice.ts
```

→

```text
modules/invoicing/infrastructure/Invoice.model.ts
```

---

# 54. Payment

```text
lib/models/Payment.ts
```

→

```text
modules/payments/infrastructure/Payment.model.ts
```

---

# 55. Settings

```text
lib/models/Settings.ts
```

→

```text
modules/settings/infrastructure/Settings.model.ts
```

---

# 56. ContactMessage

```text
lib/models/ContactMessage.ts
```

→

```text
modules/contact/infrastructure/ContactMessage.model.ts
```

---

# 57. Counter

```text
lib/models/Counter.ts
```

→

```text
modules/shared/infrastructure/Counter.model.ts
```

I would actually allow a small:

```text
modules/shared/
```

because `Counter` is infrastructure, not a business domain.

---

# 58. `lib/storefront/*`

This entire folder is already very close to your future `modules`.

I would move it.

### Cart

```text
lib/storefront/cart.ts
```

→

```text
modules/cart/application/cart.ts
```

### Checkout

```text
lib/storefront/checkout.ts
```

→

```text
modules/checkout/application/checkout.ts
```

### Pricing

```text
lib/storefront/pricing.ts
```

→

```text
modules/checkout/domain/pricing.ts
```

or:

```text
modules/orders/domain/pricing.ts
```

depending on where you decide price calculation belongs.

I prefer:

```text
modules/catalog/domain/pricing.ts
```

if product pricing rules are catalog-wide.

---

# 59. Storefront identity

```text
lib/storefront/identity.ts
```

→

```text
modules/identity/application/identity.ts
```

---

# 60. Account linking

```text
lib/storefront/account-linking.ts
```

→

```text
modules/identity/application/account-linking.ts
```

---

# 61. Ownership

```text
lib/storefront/ownership.ts
```

→

```text
modules/orders/application/ownership.ts
```

or:

```text
modules/customers/application/ownership.ts
```

I prefer `orders` because the current functions are largely order ownership checks.

---

# 62. Storefront session

```text
lib/storefront/session.ts
```

→

```text
modules/identity/application/guest-session.ts
```

---

# 63. Storefront constants

```text
lib/storefront/constants.ts
```

Move only if they are domain constants.

Otherwise:

```text
lib/constants/
```

If they are cart/session business constants:

```text
modules/cart/constants.ts
```

---

# 64. Storefront order number

```text
lib/storefront/order-number.ts
```

→

```text
modules/orders/application/order-number.ts
```

---

# 65. Storefront order/payment status

```text
lib/storefront/order-status.ts
lib/storefront/payment-status.ts
```

→

```text
modules/orders/domain/order-status.ts
modules/payments/domain/payment-status.ts
```

---

# 66. Storefront validation

```text
lib/storefront/validation.ts
```

Do not keep a generic file with mixed validation.

Split it:

```text
modules/cart/validation/
modules/checkout/validation/
modules/orders/validation/
```

where needed.

---

# 67. Abandoned cart

```text
lib/storefront/abandoned-cart.ts
```

→

```text
modules/cart/application/process-abandoned-carts.ts
```

---

# 68. Safe redirect

```text
lib/storefront/safe-redirect.ts
```

This is not really a business domain.

Keep:

```text
lib/utilities/safe-redirect.ts
```

---

# 69. WhatsApp

Current:

```text
lib/storefront/whatsapp.ts
lib/whatsapp/index.ts
```

These overlap.

Consolidate.

I recommend:

```text
modules/notifications/whatsapp/
├── whatsapp.ts
└── ...
```

The UI component stays in:

```text
components/shared/WhatsAppFab.tsx
```

---

# 70. `lib/server/*`

These are some of the most important files to move.

## availability

```text
lib/server/availability.ts
```

→

```text
modules/inventory/application/availability.ts
```

---

## catalog

```text
lib/server/catalog.ts
```

→

```text
modules/catalog/application/catalog.ts
```

---

## customers

```text
lib/server/customers.ts
```

→

```text
modules/customers/application/customers.ts
```

---

## document number

```text
lib/server/documentNumber.ts
```

→

```text
modules/shared/application/document-number.ts
```

Eventually this should use `Counter`.

---

## sales dashboard

```text
lib/server/sales-dashboard.ts
```

→

```text
modules/analytics/application/sales-dashboard.ts
```

---

# 71. `lib/sales.ts`

This is business logic.

Move:

```text
lib/sales.ts
```

to:

```text
modules/invoicing/domain/calculations.ts
```

or potentially:

```text
modules/sales/domain/calculations.ts
```

I would use:

```text
modules/invoicing/domain/calculations.ts
```

because it is primarily invoice/line-item financial calculation.

---

# 72. `lib/schemas/sales.ts`

Move:

```text
lib/schemas/sales.ts
```

to:

```text
modules/sales/validation/sales.ts
```

But because you already have `lib/validation`, you could instead consolidate all server validation into:

```text
modules/sales/validation/
```

---

# 73. Validation folder

Current:

```text
lib/validation/
├── address.ts
├── checkout.ts
├── common.ts
├── index.ts
├── payment.ts
└── product.ts
```

These should become domain-owned.

```text
modules/customers/validation/address.ts
modules/checkout/validation/checkout.ts
modules/payments/validation/payment.ts
modules/catalog/validation/product.ts
```

`common.ts` can remain:

```text
lib/validation/common.ts
```

if it contains genuinely generic Zod helpers.

---

# 74. Auth

Keep:

```text
lib/auth/
```

I would **not move Auth.js configuration into `modules/identity` yet**.

Authentication infrastructure is one of the few things that deserves a clear technical `lib/auth` boundary.

Keep:

```text
lib/auth/
├── config.ts
├── index.ts
├── permissions.ts
├── sentinel.ts
├── session.ts
└── sign-out.ts
```

Business identity operations can live in:

```text
modules/identity/
```

So:

```text
Auth.js
   ↓
lib/auth
   ↓
modules/identity
```

---

# 75. Database

Keep:

```text
lib/db/
```

Exactly where it is conceptually.

```text
lib/db/
├── client.ts
├── index.ts
└── mongodb.ts
```

These are infrastructure/bootstrap, not domain logic.

---

# 76. Cloudinary

Keep:

```text
lib/cloudinary/
```

This is external infrastructure.

```text
lib/cloudinary/
├── index.ts
└── sign.server.ts
```

Do not move Cloudinary into a product feature.

---

# 77. Config

Keep:

```text
lib/config/
```

For:

```text
mpesa.ts
```

Though I would eventually have:

```text
lib/config/
├── auth.ts
├── database.ts
├── email.ts
├── cloudinary.ts
└── mpesa.ts
```

only if those configs actually become necessary.

Don't create empty configuration files just for symmetry.

---

# 78. Formatting

Current:

```text
lib/format/index.ts
```

Move/rename:

```text
lib/format/
```

to:

```text
lib/formatting/
```

Keep generic formatting here:

```text
currency
dates
numbers
```

Do not put business calculations here.

---

# 79. HTTP

Current:

```text
lib/http.ts
lib/api.ts
```

I recommend:

```text
lib/http/
├── client.ts
├── errors.ts
└── response.ts
```

And:

```text
lib/api.ts
```

should either be deleted or consolidated into that folder.

Your `apiRequestRaw()` and broken `parseJsonBody()` should be removed/fixed during this migration.

---

# 80. Image URL

```text
lib/image-url.ts
```

Keep:

```text
lib/utilities/image-url.ts
```

unless it becomes specifically Cloudinary-related.

---

# 81. Shop filters

Current:

```text
lib/shopFilters.ts
```

This is storefront/catalog-specific.

Move:

```text
modules/catalog/domain/shop-filters.ts
```

if it contains business/query rules.

If it is purely UI state:

```text
features/storefront/catalog/shop/shop-filters.ts
```

This distinction should be based on its imports.

---

# 82. Constants

Current:

```text
lib/constants/index.ts
```

Keep:

```text
lib/constants/
```

for genuinely global constants.

Do **not** put feature-specific constants there.

For example:

```text
contact-data.ts
```

belongs to contact.

---

# 83. `lib/routes.ts`

Keep:

```text
lib/routes.ts
```

This is a cross-application routing utility.

Potentially:

```text
lib/constants/routes.ts
```

but not worth changing now.

---

# 84. `lib/utils`

Current:

```text
lib/utils/index.ts
```

Keep:

```text
lib/utilities/
```

but aggressively keep this small.

If a function has domain meaning, it should move to its domain instead.

Avoid:

```text
lib/utils/doEverything.ts
```

---

# 85. SERVICES — rename them to `client`

This is one of the clearest changes I recommend.

Your current:

```text
services/
├── sentinel/
├── shared/
└── storefront/
```

is mostly **browser-side API communication**, not server business services.

Therefore:

```text
services/sentinel/
```

→

```text
client/sentinel/
```

---

# 86. Sentinel client services

Move:

```text
services/sentinel/admin-store-order.service.ts
→ client/sentinel/store-orders.ts

services/sentinel/contact-message.service.ts
→ client/sentinel/contact-messages.ts

services/sentinel/invoice.service.ts
→ client/sentinel/invoices.ts

services/sentinel/order.service.ts
→ client/sentinel/orders.ts

services/sentinel/payment.service.ts
→ client/sentinel/payments.ts

services/sentinel/quotation.service.ts
→ client/sentinel/quotations.ts

services/sentinel/sales-dashboard.service.ts
→ client/sentinel/sales-dashboard.ts

services/sentinel/settings.service.ts
→ client/sentinel/settings.ts

services/sentinel/user.service.ts
→ client/sentinel/users.ts
```

This makes their actual role obvious.

---

# 87. Shared client services

```text
services/shared/category.service.ts
→ client/shared/categories.ts

services/shared/product.service.ts
→ client/shared/products.ts
```

---

# 88. Storefront client services

```text
services/storefront/account.service.ts
→ client/storefront/account.ts

services/storefront/address.service.ts
→ client/storefront/addresses.ts

services/storefront/store-cart.service.ts
→ client/storefront/cart.ts

services/storefront/store-order.service.ts
→ client/storefront/orders.ts
```

---

# 89. Why this distinction matters

The resulting architecture becomes:

```text
Browser component
      ↓
client/storefront/orders.ts
      ↓
/api/store-orders
      ↓
modules/orders
      ↓
Mongoose
```

Instead of:

```text
Browser component
      ↓
services/storefront/store-order.service.ts
```

where the word `service` is ambiguous.

---

# 90. Hooks

Your current hooks are generally correctly located.

Keep:

```text
hooks/
├── use-mobile.ts
├── useDebounce.ts
├── usePagination.ts
└── useSearch.ts
```

because these are reusable.

But domain hooks should move toward their feature.

For example:

```text
useCart.ts
→ features/storefront/cart/hooks/useCart.ts

useProduct.ts
→ features/storefront/catalog/products/hooks/useProduct.ts

useShopFilters.ts
→ features/storefront/catalog/shop/hooks/useShopFilters.ts

use-order-payment-status.ts
→ features/storefront/checkout/hooks/useOrderPaymentStatus.ts

use-customer-session.ts
→ features/storefront/account/hooks/useCustomerSession.ts

useCloudinaryUpload.ts
```

This last one can remain global:

```text
hooks/useCloudinaryUpload.ts
```

because it is infrastructure/reusable.

---

# 91. Zustand store

Current:

```text
store/cart-ui-store.ts
store/server-cart-store.ts
```

I would change to:

```text
features/storefront/cart/store/
├── cart-ui-store.ts
└── server-cart-store.ts
```

because both are cart-specific.

If you later introduce genuinely global stores, keep:

```text
store/
```

for those.

---

# 92. Types

Current types are already reasonably organized.

Keep the folder but make it more consistent.

```text
types/
├── category.ts
├── product.ts
├── next-auth.d.ts
├── storefront/
└── sentinel/
```

I recommend eventually:

```text
types/
├── auth.ts
├── common.ts
├── catalog.ts
├── storefront/
└── sentinel/
```

But don't duplicate domain types if the module can export its own type.

For example, if:

```text
modules/catalog/
```

owns:

```ts
Product
```

you shouldn't necessarily maintain a second independent:

```text
types/product.ts
```

---

# 93. Types should not duplicate Mongoose models

This is important.

Avoid:

```text
Product Mongoose type
+
Product API type
+
Product UI type
+
Product DTO
+
Product type
```

unless they genuinely differ.

Use:

```text
ProductDocument
ProductDTO
```

where there is a meaningful boundary.

---

# 94. Scripts

Keep:

```text
scripts/
```

exactly where it is.

Current:

```text
scripts/admin/
├── backfill-customer-role.ts
└── create-admin.ts
```

These are operational scripts.

No need to move them into modules.

They can import:

```text
modules/identity
```

and:

```text
lib/db
```

---

# 95. Tests

Keep:

```text
tests/
```

but reorganize it to mirror domains.

Current:

```text
tests/
├── api/
├── lib/
└── models/
```

is based on technical implementation.

I recommend:

```text
tests/
├── identity/
├── catalog/
├── cart/
├── checkout/
├── orders/
├── quotations/
├── invoicing/
├── payments/
├── inventory/
├── customers/
└── integration/
```

For example:

```text
tests/api/quotations-duplicate.test.ts
```

→

```text
tests/quotations/duplicate.test.ts
```

And:

```text
tests/lib/storefront/ownership.test.ts
```

→

```text
tests/orders/ownership.test.ts
```

---

# 96. Test setup

Keep:

```text
tests/setup/db.ts
```

or:

```text
tests/setup/mongodb.ts
```

This is test infrastructure.

---

# 97. Exact mapping summary

Here is the high-level transformation of your existing folders:

```text
CURRENT                                      NEW
────────────────────────────────────────────────────────────

app/                                         app/
  ↓                                            ↓
keep routes exactly here                     keep

components/ui/                              components/ui/
  ↓                                            ↓
keep                                       keep

components/shared/                          components/shared/
  ↓                                            ↓
mostly keep                                keep

components/common/storefront/              components/storefront/
  ↓                                            ↓
move                                       move

components/common/sentinel/                components/sentinel/
  ↓                                            ↓
move                                       move

components/account/                        features/storefront/account/components/
  ↓                                            ↓
move                                       move

components/cart/                           features/storefront/cart/components/
  ↓                                            ↓
move                                       move

components/checkout/                       features/storefront/checkout/components/
  ↓                                            ↓
move                                       move

components/category/                       features/storefront/catalog/categories/components/
  ↓                                            ↓
move                                       move

components/home/                           features/storefront/home/components/
  ↓                                            ↓
move                                       move

components/contact/                        features/storefront/contact/
  ↓                                            ↓
move                                       move

components/products/                       features/storefront/catalog/
  ↓                                            ↓
split                                      split

components/shop/                           features/storefront/catalog/shop/components/
  ↓                                            ↓
move                                       move

components/sentinel/product/               features/sentinel/products/components/
  ↓                                            ↓
move                                       move

components/sentinel/orders/                features/sentinel/orders/components/
  ↓                                            ↓
move                                       move

components/sentinel/quotations/            features/sentinel/quotations/components/
  ↓                                            ↓
move                                       move

components/sentinel/invoices/              features/sentinel/invoices/components/
  ↓                                            ↓
move                                       move

components/sentinel/sales/                 features/sentinel/sales/components/
  ↓                                            ↓
move                                       move

components/sentinel/dashboard/             features/sentinel/dashboard/components/
  ↓                                            ↓
move                                       move

components/sentinel/store-orders/          features/sentinel/store-orders/components/
  ↓                                            ↓
move                                       move

components/sentinel/contact-messages/      features/sentinel/contact-messages/components/
  ↓                                            ↓
move                                       move

components/sentinel/User*                  features/sentinel/users/components/
  ↓                                            ↓
move                                       move

components/layouts/                        DELETE / consolidate into app/
  ↓

features/catalog/                          features/storefront/catalog/
  ↓                                            ↓
move                                       move

features/storefront/home/                  keep / normalize
  ↓

features/sentinel/                         keep / expand
  ↓

services/                                   client/
  ↓                                            ↓
rename                                     rename

lib/models/                                modules/*/infrastructure/
  ↓                                            ↓
move                                       distribute

lib/storefront/                            modules/*
  ↓                                            ↓
move                                       distribute

lib/server/                                 modules/*
  ↓                                            ↓
move                                       distribute

lib/validation/                            modules/*/validation/
  ↓                                            ↓
split                                      split

lib/sales.ts                               modules/invoicing/domain/
  ↓                                            ↓
move                                       move

lib/schemas/sales.ts                       modules/sales/validation/
  ↓                                            ↓
move                                       move

lib/auth/                                   lib/auth/
  ↓                                            ↓
keep                                       keep

lib/db/                                     lib/db/
  ↓                                            ↓
keep                                       keep

lib/cloudinary/                             lib/cloudinary/
  ↓                                            ↓
keep                                       keep

lib/config/                                 lib/config/
  ↓                                            ↓
keep                                       keep

lib/format/                                 lib/formatting/
  ↓                                            ↓
rename                                     rename

lib/http.ts                                 lib/http/
  ↓                                            ↓
refactor                                   refactor

lib/api.ts                                  lib/http/
  ↓                                            ↓
consolidate                                consolidate

hooks/                                      hooks/
  ↓                                            ↓
keep generic                               move domain hooks

store/                                      feature stores
  ↓                                            ↓
move cart-specific                         keep global only

types/                                      types/
  ↓                                            ↓
mostly keep                                simplify

tests/                                      tests/
  ↓                                            ↓
reorganize by domain                       reorganize

scripts/                                    scripts/
  ↓                                            ↓
keep                                       keep
```

---

# 98. The final architecture for HSE Hub

After the refactor, I would want to see this:

```text
project/
│
├── app/                              # HTTP/Next.js routing
│   ├── (public)/
│   ├── (admin)/
│   ├── (auth)/
│   └── api/
│
├── features/                         # UI/application features
│   │
│   ├── storefront/
│   │   ├── home/
│   │   ├── catalog/
│   │   │   ├── products/
│   │   │   ├── product-detail/
│   │   │   ├── categories/
│   │   │   ├── category/
│   │   │   ├── shop/
│   │   │   ├── search/
│   │   │   ├── featured/
│   │   │   └── new-arrivals/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── account/
│   │   ├── contact/
│   │   └── marketing/
│   │
│   └── sentinel/
│       ├── auth/
│       ├── dashboard/
│       ├── products/
│       ├── categories/
│       ├── orders/
│       ├── store-orders/
│       ├── quotations/
│       ├── invoices/
│       ├── payments/
│       ├── sales/
│       ├── users/
│       ├── contact-messages/
│       ├── settings/
│       ├── banners/
│       ├── testimonials/
│       └── profile/
│
├── modules/                          # Business/domain layer
│   │
│   ├── identity/
│   ├── catalog/
│   ├── customers/
│   ├── cart/
│   ├── checkout/
│   ├── inventory/
│   ├── orders/
│   ├── quotations/
│   ├── invoicing/
│   ├── payments/
│   ├── notifications/
│   ├── contact/
│   ├── settings/
│   └── analytics/
│
├── components/                       # Reusable UI
│   ├── ui/
│   ├── shared/
│   ├── storefront/
│   └── sentinel/
│
├── client/                           # Browser API clients
│   ├── storefront/
│   ├── sentinel/
│   └── shared/
│
├── lib/                              # Technical infrastructure
│   ├── auth/
│   ├── db/
│   ├── cloudinary/
│   ├── config/
│   ├── validation/
│   ├── formatting/
│   ├── http/
│   └── utilities/
│
├── hooks/
├── store/
├── types/
├── tests/
└── scripts/
```

---

# 99. The dependency direction I want you to enforce

This is more important than the folders themselves:

```text
                         ┌──────────────┐
                         │     app      │
                         │ routes/API   │
                         └──────┬───────┘
                                │
                   ┌────────────┴────────────┐
                   ↓                         ↓
             features/                   client/
             UI/page logic             browser API calls
                   │                         │
                   │                         ↓
                   │                    app/api
                   │                         │
                   └────────────┬────────────┘
                                ↓
                            modules/
                         business logic
                                │
                    ┌───────────┴───────────┐
                    ↓                       ↓
                 models                 external
                    │                   services
                    ↓
                MongoDB
```

And:

```text
components/
    ↓
should NEVER directly import
    ↓
modules/*/infrastructure/*.model.ts
```

Likewise:

```text
features/
    ↓
should NOT directly use
    ↓
Mongoose
```

Instead:

```text
Feature
  ↓
client API
  ↓
route
  ↓
module/use case
  ↓
repository/model
```

For server-rendered features, the feature can call a server-side module directly when appropriate:

```text
Server Component
      ↓
module/application
      ↓
repository/model
```

---

# 100. One important correction to the proposed architecture

I would **not make `modules` a giant enterprise-style Clean Architecture system** with:

```text
domain/
application/
infrastructure/
repositories/
ports/
adapters/
factories/
interfaces/
```

inside every module.

For this project, that would be over-engineering.

Start with:

```text
modules/orders/
├── application/
├── domain/
└── infrastructure/
```

**only where the module actually needs those boundaries.**

For a small module:

```text
modules/customers/
├── customers.ts
└── Customer.model.ts
```

may be completely sufficient.

The architecture should serve HSE Hub, not become an architecture demonstration.

---

## The three most important moves

If you're going to physically reorganize the repository, I would do these first:

### 1. Move all UI domain components out of `components/*`

For example:

```text
components/cart
→ features/storefront/cart/components

components/checkout
→ features/storefront/checkout/components

components/sentinel/orders
→ features/sentinel/orders/components
```

### 2. Rename `services/` → `client/`

Because those files are API clients, not server business services.

```text
services/
→ client/
```

### 3. Move business logic out of `lib/server`, `lib/storefront`, and `lib/models` into `modules`

That produces the most important architectural boundary:

```text
app
  ↓
features/client
  ↓
modules
  ↓
MongoDB/external services
```

**I would do those three before touching anything else.** They give you a much cleaner architecture without changing how the application actually works.
