import { Schema, type Model, model, models } from "mongoose";

export const baseOptions = { timestamps: true, versionKey: false } as const;
export const status = { type: String, enum: ["draft", "published"], default: "draft", index: true } as const;

export function getModel<T>(name: string, schema: Schema<T>): Model<T> {
  return (models[name] as Model<T>) || model<T>(name, schema);
}
