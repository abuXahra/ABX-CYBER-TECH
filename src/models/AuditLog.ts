import { Schema } from "mongoose";
import { getModel } from "./_helpers";

const schema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "Admin" },
    actorEmail: String,
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true },
    entityId: String,
    summary: { type: String, maxlength: 300 },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false, collection: "audit_logs" },
);
schema.index({ createdAt: -1 });

export const AuditLog = getModel("AuditLog", schema);
