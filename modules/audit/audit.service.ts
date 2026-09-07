import type { ClientSession } from "mongoose";

import { AuditLogModel, type AuditAction } from "@/lib/models/AuditLog";

/**
 * Server-side entry point for the audit trail. Extend this — and
 * AuditAction/AUDIT_ACTIONS in lib/models/AuditLog.ts — rather than
 * standing up a second logging mechanism elsewhere; every mutation
 * worth auditing (payments, orders, quotations, invoices, inventory,
 * products/categories, admin/user changes) should end up here so the
 * trail lives in one place and one shape.
 *
 * Fields never allowed in `metadata`, defensively stripped even if a
 * caller passes them by mistake — an audit trail is exactly the kind of
 * long-lived, broadly-readable record a secret must never leak into.
 */
const REDACTED_METADATA_KEYS = new Set([
  "password",
  "passwordHash",
  "newPassword",
  "currentPassword",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "apiKey",
]);

function redactMetadata(metadata: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!metadata) return {};

  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (REDACTED_METADATA_KEYS.has(key)) continue;
    clean[key] = value;
  }
  return clean;
}

export interface AuditEventInput {
  actor: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Records one audit event. When called from inside a
 * `session.withTransaction(...)` callback that also mutates the
 * financial/domain data being audited, ALWAYS pass that same `session`
 * — this makes the audit row part of the same atomic write as the
 * mutation it describes, so a transaction that ultimately fails/aborts
 * (including MongoDB's automatic whole-callback retry on a transient
 * write conflict) can never leave behind an audit record for a change
 * that didn't actually happen. Callers that log after a non-transactional,
 * already-committed single-document write (e.g. a simple findByIdAndUpdate)
 * can omit `session`.
 *
 * Only ever call this after the mutation it describes has succeeded —
 * there is deliberately no "failed" status on the log itself; a failed
 * mutation should produce no audit record at all rather than a
 * misleading "successful" one with a failure flag that every reader of
 * the trail would have to remember to check.
 */
export async function recordAuditEvent(input: AuditEventInput, session?: ClientSession) {
  const [created] = await AuditLogModel.create(
    [
      {
        actor: input.actor,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        metadata: redactMetadata(input.metadata),
      },
    ],
    session ? { session } : undefined,
  );
  return created;
}
