import { Schema } from "mongoose";
import { baseOptions, getModel } from "./_helpers";
import { demoFields, enforceDemoRules, publishFields } from "./_demo";

const schema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, required: true, trim: true },
    summary: { type: String, default: "", maxlength: 300 },
    body: { type: String, default: "" }, // sanitised HTML
    thumbnailMediaId: { type: String, default: null },
    galleryMediaIds: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
    projectUrl: { type: String, default: "" },
    featured: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0, index: true },
    ...publishFields,
    ...demoFields,
  },
  { ...baseOptions, collection: "projects" },
);

enforceDemoRules(schema);

export const Project = getModel("Project", schema);
