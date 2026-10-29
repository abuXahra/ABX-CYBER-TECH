import { Schema } from "mongoose";
import { baseOptions, getModel } from "./_helpers";

/** Page registry (metadata only). Page content lives in versioned content_revisions. */
const schema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    system: { type: Boolean, default: true }, // system pages cannot be deleted
  },
  { ...baseOptions, collection: "pages" },
);

export const Page = getModel("Page", schema);
