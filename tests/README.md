# Tests

Run with:

```
pnpm install
pnpm test          # single run
pnpm test:watch    # watch mode
```

Uses [Vitest](https://vitest.dev). Integration tests spin up a real, ephemeral
MongoDB via `mongodb-memory-server` (see `tests/setup/db.ts`) — no external
database or `.env` needed to run them. The first run downloads a MongoDB
binary, which needs network access; after that it's cached locally.

## What's covered

This suite focuses on the auth/identity unification work and the quotation
bug found while doing it — not a full audit of every pre-existing route.

- `tests/lib/storefront/ownership.test.ts` — the post-unification ownership
  filters (`ownerFilter`, `customerOrderFilter`, `orderBelongsToCustomer`),
  now that there's no `userModel` discriminator.
- `tests/lib/storefront/session.test.ts` — `resolveCartIdentity`'s collapse
  to a single session (no more staff-vs-customer precedence), and its guest
  cookie fallback.
- `tests/models/identity-unification.test.ts` — `Cart`/`StoreOrder` refing
  `StorefrontCustomer` directly with no discriminator field, and the
  single-admin constraint carried over from the old `User` model.
- `tests/api/quotations-duplicate.test.ts` — regression coverage for the
  quotation "Duplicate" bug: the `POST /api/quotations/[id]` handler used
  to ignore the request body and always run the convert-to-invoice branch,
  so clicking Duplicate either errored on a non-accepted quotation or
  silently converted an accepted one instead of copying it.

## Not covered yet

Every other API route, the storefront checkout/cart flow end-to-end, the
Auth.js config itself (Credentials/Google/Facebook providers, single-session
enforcement), and any UI/component tests. Worth adding incrementally as
those areas change, rather than all at once.
