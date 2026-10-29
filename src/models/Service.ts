import { Schema } from "mongoose";
import { baseOptions, getModel, status } from "./_helpers";

const schema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, required: true, maxlength: 240 },
    description: { type: String, default: "" }, // sanitised HTML
    icon: { type: String, default: "globe" },
    imageMediaId: { type: String, default: null },
    features: { type: [String], default: [] },
    order: { type: Number, default: 0, index: true },
    status,
  },
  { ...baseOptions, collection: "services" },
);

export const Service = getModel("Service", schema);
