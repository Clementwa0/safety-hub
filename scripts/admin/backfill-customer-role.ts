/**
 * One-time backfill: sets `role: "customer"` and `status: "active"` on any
 * `storefront_customers` document that's missing them.
 *
 * WHY THIS EXISTS
 * ----------------
 * The Auth.js `createUser` event (lib/auth/config.ts) used to backfill new
 * Google/Facebook/email signups with `$setOnInsert`, which is a no-op on a
 * plain (non-upsert) `findByIdAndUpdate` call — the adapter had already
 * inserted the user via the native MongoDB driver (bypassing Mongoose
 * entirely, so the schema's `default: "customer"`/`default: "active"`
 * never applied either) by the time that event ran. That's fixed to use
 * `$set` now, so it only affects accounts created before the fix.
 *
 * A missing `role` doesn't break sign-in or access control — session role
 * already falls back to "customer" via `token.role = user.role ?? "customer"`
 * in the `jwt` callback — but it DOES silently exclude the account from
 * anything that queries the stored field directly, e.g.
 * `lib/storefront/abandoned-cart.ts`'s `role: "customer"` filter.
 *
 * USAGE
 * -----
 *   npx tsx scripts/admin/backfill-customer-role.ts            # dry run — reports only, writes nothing
 *   npx tsx scripts/admin/backfill-customer-role.ts --apply     # actually performs the update
 *
 * Safe to re-run — only touches documents currently missing the field.
 */
import "dotenv/config";
import mongoose from "mongoose";

import { connectToDatabase } from "../../lib/db";
import { StorefrontCustomerModel } from "../../lib/models/StorefrontCustomer";

async function main() {
  const apply = process.argv.includes("--apply");

  await connectToDatabase();

  try {
    const affected = await StorefrontCustomerModel.find({ role: { $exists: false } })
      .select("email")
      .lean();

    console.log(`\n${apply ? "APPLY" : "DRY RUN"} — ${affected.length} account(s) missing "role".\n`);

    if (affected.length === 0) {
      console.log("Nothing to do.\n");
      return;
    }

    for (const doc of affected) console.log(`  - ${doc.email}`);

    if (!apply) {
      console.log(`\nThis was a dry run — nothing was written. Re-run with --apply to perform the update.\n`);
      return;
    }

    const result = await StorefrontCustomerModel.updateMany(
      { role: { $exists: false } },
      { $set: { role: "customer", status: "active" } },
    );

    console.log(`\nUpdated ${result.modifiedCount} account(s).\n`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("backfill-customer-role failed:", error);
  process.exitCode = 1;
});
