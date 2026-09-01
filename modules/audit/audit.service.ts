import { AuditLogModel } from "@/lib/models/AuditLog";

export interface AuditEventInput {
  actor: string;
  action: "payment_recorded" | "payment_voided" | "settings_updated" | "inventory_adjusted" | "order_mutated" | "quotation_mutated" | "invoice_mutated" | "user_mutated";
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export async function recordAuditEvent(input: AuditEventInput) {
  return AuditLogModel.create({
    actor: input.actor,
    action: input.action,
    entity: input.entity,
    entityId: input.entityId,
    metadata: input.metadata ?? {},
  });
}
