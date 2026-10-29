import { Schema } from "mongoose";
import { baseOptions, getModel } from "./_helpers";
import { demoFields, enforceDemoRules, publishFields } from "./_demo";

const schema = new Schema(
  {
    authorName: { type: String, required: true, trim: true, maxlength: 80 },
    authorRole: { type: String, default: "", maxlength: 120 },
    company: { type: String, default: "", maxlength: 120 },
    quote: { type: String, required: true, maxlength: 800 },
    avatarMediaId: { type: String, default: null },
    order: { type: Number, default: 0, index: true },
    ...publishFields, // only genuine, published testimonials are ever shown publicly
    ...demoFields,
  },
  { ...baseOptions, collection: "testimonials" },
);

enforceDemoRules(schema);

export const Testimonial = getModel("Testimonial", schema);
