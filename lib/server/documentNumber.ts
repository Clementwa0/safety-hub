import type { Model } from "mongoose";

import { nextDocumentNumber } from "@/lib/sales";

const MAX_ATTEMPTS = 5;

function isDuplicateNumberError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000 &&
    "keyPattern" in error &&
    Boolean((error as { keyPattern?: Record<string, unknown> }).keyPattern?.number)
  );
}

/**
 * Allocates a sequential document number (e.g. QUO-2026-0001) and creates
 * the document in one step. Replaces the old
 * `` `QUO-${year}-${Date.now().toString().slice(-4)}` `` pattern, which
 * had two problems: the last-4-digits-of-a-timestamp scheme isn't a real
 * numbering sequence, and two requests landing in the same millisecond
 * could produce the exact same number.
 *
 * `nextDocumentNumber` (lib/sales.ts) computes the next number from
 * whatever's currently in the DB for this prefix/year, same as before.
 * What's new is the retry loop: the model's `number` field already has a
 * `unique: true` index, so instead of trying to prevent the read-then-
 * insert race with a lock, we just let Mongo catch it - on a duplicate-key
 * error for `number` we recompute (another document was just inserted, so
 * the "next" number has moved on) and try again, up to MAX_ATTEMPTS times.
 * Any other error is rethrown immediately.
 */
export async function createWithDocumentNumber<T>(
  Model: Model<T>,
  prefix: string,
  buildDoc: (number: string) => Record<string, unknown>,
): Promise<T> {
  const year = new Date().getFullYear();
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const existing = await Model.find({ number: { $regex: `^${prefix}-${year}-` } })
      .select("number")
      .lean();
    const number = nextDocumentNumber(
      prefix,
      existing.map((doc) => (doc as unknown as { number: string }).number),
    );

    try {
      return await Model.create(buildDoc(number) as never);
    } catch (error) {
      if (!isDuplicateNumberError(error)) throw error;
      lastError = error;
      // Another request grabbed this number first - loop and recompute.
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Failed to allocate a unique document number");
}
