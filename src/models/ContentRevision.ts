import { Schema, type Query } from "mongoose";
import { baseOptions, getModel } from "./_helpers";
import { SCOPES } from "@/lib/cms/scopes";

const schema = new Schema(
  {
    scope: { type: String, enum: SCOPES, required: true },
    key: { type: String, required: true },
    status: { type: String, enum: ["draft", "published"], required: true },
    version: { type: Number }, // set on published revisions only
    /** "<scope>:<key>:<version>" — set on published revisions only. A plain sparse unique index on it makes a duplicate
     *  version impossible on any MongoDB-compatible server (does not rely on partial-index support). */
    versionKey: { type: String },
    content: { type: Schema.Types.Mixed, required: true },
    previousRevisionId: { type: Schema.Types.ObjectId, ref: "ContentRevision", default: null },
    restoredFromRevisionId: { type: Schema.Types.ObjectId, ref: "ContentRevision", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", default: null }, // null for system actions (seed)
    source: { type: String, enum: ["admin", "system"], default: "admin" },
    notes: { type: String, maxlength: 500, default: "" },
    publishedAt: { type: Date },
  },
  { ...baseOptions, collection: "content_revisions" },
);

schema.index({ scope: 1, key: 1, status: 1, version: -1 });
// One working draft per target.
schema.index({ scope: 1, key: 1 }, { unique: true, partialFilterExpression: { status: "draft" }, name: "one_draft_per_target" });
schema.index({ versionKey: 1 }, { unique: true, sparse: true, name: "unique_version_key" });
// Version numbers are unique per target → concurrent publishes collide instead of overwriting.
schema.index({ scope: 1, key: 1, version: 1 }, { unique: true, partialFilterExpression: { status: "published" }, name: "unique_published_version" });

/* Published revisions are immutable: mutation/deletion queries are forced to match drafts only. */
schema.pre(
  ["updateOne", "updateMany", "findOneAndUpdate", "replaceOne", "deleteOne", "deleteMany", "findOneAndDelete"],
  function (this: Query<unknown, unknown>, next) {
    this.where({ status: "draft" });
    next();
  },
);
schema.pre("save", function (next) {
  if (!this.isNew && this.status === "published") return next(new Error("Published revisions are immutable"));
  next();
});

export const ContentRevision = getModel("ContentRevision", schema);
