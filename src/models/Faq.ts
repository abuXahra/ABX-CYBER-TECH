import { Schema } from "mongoose";
import { baseOptions, getModel, status } from "./_helpers";

const schema = new Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: 200 },
    answer: { type: String, required: true, maxlength: 3000 },
    order: { type: Number, default: 0, index: true },
    status,
  },
  { ...baseOptions, collection: "faqs" },
);

export const Faq = getModel("Faq", schema);
