import { Schema } from "mongoose";
import { baseOptions, getModel } from "./_helpers";

const schema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, default: "", maxlength: 300 },
    body: { type: String, default: "" }, // sanitised HTML from Tiptap
    featuredImageMediaId: { type: String, default: null },
    category: { type: String, default: "", index: true },
    tags: { type: [String], default: [], index: true },
    status: { type: String, enum: ["draft", "scheduled", "published"], default: "draft", index: true },
    publishedAt: { type: Date, index: true }, // future date + status "scheduled" = scheduled publishing
    seo: { title: { type: String, default: "" }, description: { type: String, default: "" }, noindex: { type: Boolean, default: false } },
  },
  { ...baseOptions, collection: "posts" },
);

export const Post = getModel("Post", schema);
