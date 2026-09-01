import mongoose, { Schema, type Document, type Model } from "mongoose";

export type AuditAction =
  | "payment_recorded"
  | "payment_voided"
  | "settings_updated"
  | "inventory_adjusted"
  | "order_mutated"
  | "quotation_mutated"
  | "invoice_mutated"
  | "user_mutated";

export interface IAuditLog extends Document {
  actor: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: String, required: true, trim: true },
    action: {
      type: String,
      enum: [
        "payment_recorded",
        "payment_voided",
        "settings_updated",
        "inventory_adjusted",
        "order_mutated",
        "quotation_mutated",
        "invoice_mutated",
        "user_mutated",
      ],
      required: true,
    },
    entity: { type: String, required: true, trim: true },
    entityId: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "audit_logs",
  },
);

auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });

export const AuditLogModel: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
