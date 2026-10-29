import { Schema } from "mongoose";
import { baseOptions, getModel } from "./_helpers";
import { SCOPES } from "@/lib/cms/scopes";

/** The only mutable "what is live" reference. Publishing = one atomic pointer swap. */
const schema = new Schema(
  {
    scope: { type: String, enum: SCOPES, required: true },
    key: { type: String, required: true },
    publishedRevisionId: { type: Schema.Types.ObjectId, ref: "ContentRevision", required: true },
    publishedVersion: { type: Number, required: true },
  },
  { ...baseOptions, collection: "content_pointers" },
);
schema.index({ scope: 1, key: 1 }, { unique: true });

export const ContentPointer = getModel("ContentPointer", schema);
