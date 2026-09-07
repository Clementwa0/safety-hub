import mongoose from "mongoose";

import { ProductModel } from "@/lib/models/Product";
import { recordAuditEvent } from "@/modules/audit/audit.service";
import { assertProductDeletable, ProductReferencedError } from "@/modules/catalog/product-guard";

export interface BulkProductDeletionResult {
  /** Ids that were actually deleted. */
  deleted: string[];
  /** Ids that exist but were skipped, with the reason they couldn't be deleted. */
  blocked: { id: string; name?: string; reason: string }[];
  /** Ids that were requested but don't exist (already deleted / bad id). */
  missing: string[];
}

/**
 * Safe domain replacement for `ProductModel.deleteMany({ _id: { $in: ids } })`.
 * The old bulk action deleted straight through the database with no regard
 * for sales/quotation/invoice/cart references or the audit trail - this
 * runs every id through the same `assertProductDeletable` guard the single
 * product DELETE route uses, only removes the ids that pass, and records
 * one audit event per deletion inside the same transaction as the delete
 * so the write and its audit record can never diverge.
 *
 * This intentionally does a best-effort partial deletion rather than an
 * all-or-nothing one: selecting 20 products and having 19 succeed with 1
 * flagged as "has sales history" is far more useful to a staff member than
 * the whole batch failing because of a single blocked product.
 */
export async function bulkDeleteProducts(
  ids: string[],
  actor: string,
): Promise<BulkProductDeletionResult> {
  const uniqueIds = Array.from(new Set(ids));

  const existing = await ProductModel.find({ _id: { $in: uniqueIds } })
    .select("name")
    .lean();
  const existingById = new Map(existing.map((product) => [String(product._id), product]));

  const missing = uniqueIds.filter((id) => !existingById.has(id));
  const deletable: string[] = [];
  const blocked: BulkProductDeletionResult["blocked"] = [];

  for (const id of uniqueIds) {
    const product = existingById.get(id);
    if (!product) continue;

    try {
      await assertProductDeletable(id);
      deletable.push(id);
    } catch (error) {
      if (error instanceof ProductReferencedError) {
        blocked.push({ id, name: product.name, reason: error.message });
      } else {
        throw error;
      }
    }
  }

  if (deletable.length === 0) {
    return { deleted: [], blocked, missing };
  }

  // `session.withTransaction` may re-run this callback from scratch on a
  // transient write conflict, so its own local state (not the `blocked`
  // array collected above, which is only ever built once, before the
  // transaction starts) must be reset at the top of every invocation
  // rather than accumulated into across retries - otherwise a retried
  // attempt would double up entries.
  let finalDeleted: string[] = [];
  let retryBlocked: BulkProductDeletionResult["blocked"] = [];

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      finalDeleted = [];
      retryBlocked = [];

      // Re-check inside the transaction against a consistent snapshot -
      // the eligibility pass above ran without a session, so something
      // could in principle have referenced a product in between. Anything
      // that now fails is simply left out of the delete/audit below and
      // reported as blocked instead of aborting the whole batch.
      for (const id of deletable) {
        try {
          await assertProductDeletable(id, session);
          finalDeleted.push(id);
        } catch (error) {
          if (error instanceof ProductReferencedError) {
            retryBlocked.push({ id, name: existingById.get(id)?.name, reason: error.message });
          } else {
            throw error;
          }
        }
      }

      if (finalDeleted.length === 0) {
        return;
      }

      await ProductModel.deleteMany({ _id: { $in: finalDeleted } }, { session });

      for (const id of finalDeleted) {
        await recordAuditEvent(
          {
            actor,
            action: "product_mutated",
            entity: "Product",
            entityId: id,
            metadata: { deleted: true, name: existingById.get(id)?.name, bulk: true },
          },
          session,
        );
      }
    });
  } finally {
    await session.endSession();
  }

  return { deleted: finalDeleted, blocked: [...blocked, ...retryBlocked], missing };
}
