import { Schema } from "mongoose";
import { baseOptions, getModel } from "./_helpers";

const schema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, trim: true, default: "Administrator" },
    passwordHash: { type: String, required: true, select: false },
    active: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { ...baseOptions, collection: "admins" },
);

export const Admin = getModel("Admin", schema);
