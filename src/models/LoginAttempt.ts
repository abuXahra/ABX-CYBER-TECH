import { Schema } from "mongoose";
import { baseOptions, getModel } from "./_helpers";

const schema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    failures: { type: Number, default: 0 },
    lockedUntil: { type: Date },
    expiresAt: { type: Date, required: true },
  },
  { ...baseOptions, collection: "login_attempts" },
);
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const LoginAttempt = getModel("LoginAttempt", schema);
