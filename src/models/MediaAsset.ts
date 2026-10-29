import { Schema } from "mongoose";
import { baseOptions, getModel } from "./_helpers";

const schema = new Schema(
  {
    publicId: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    width: Number,
    height: Number,
    format: String,
    bytes: Number,
    alt: { type: String, default: "", maxlength: 200 },
    tags: { type: [String], default: [], index: true },
    focal: { x: { type: Number, default: 0.5, min: 0, max: 1 }, y: { type: Number, default: 0.5, min: 0, max: 1 } },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    isDemo: { type: Boolean, default: false, index: true }, // sample asset: hidden from the public site unless converted
  },
  { ...baseOptions, collection: "media_assets" },
);
schema.index({ alt: "text", tags: "text", publicId: "text" });

export const MediaAsset = getModel("MediaAsset", schema);
