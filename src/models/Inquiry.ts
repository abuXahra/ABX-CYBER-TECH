import { Schema } from "mongoose";
import { baseOptions, getModel } from "./_helpers";

const schema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    phone: { type: String, default: "", maxlength: 30 },
    service: { type: String, default: "" },
    subject: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, maxlength: 5000 },
    consent: { type: Boolean, default: false },
    status: { type: String, enum: ["new", "read", "in-progress", "resolved", "spam"], default: "new", index: true },
    notes: { type: [{ body: String, authorId: Schema.Types.ObjectId, at: { type: Date, default: Date.now } }], default: [] },
    archived: { type: Boolean, default: false, index: true },
    ipHash: { type: String, index: true },
    dedupeKey: { type: String, unique: true, sparse: true }, // safe duplicate-submission handling
  },
  { ...baseOptions, collection: "inquiries" },
);
schema.index({ createdAt: -1 });

export const Inquiry = getModel("Inquiry", schema);
