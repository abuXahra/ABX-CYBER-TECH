import type { Schema } from "mongoose";

/** Metadata that marks sample content. Demo records can be previewed, but never published as genuine. */
export const demoFields = {
  isDemo: { type: Boolean, default: false, index: true },
} as const;

export const publishFields = {
  isPublished: { type: Boolean, default: false, index: true },
  publishedAt: { type: Date },
} as const;

const MESSAGE = "Demo content cannot be published. Convert it to a genuine entry after verification first.";

/**
 * Rule enforced at the data layer: a demo record can never be published.
 * It must first be converted into a genuine entry (after verification) — see src/lib/demo/core.ts.
 * Implemented as field validators so it holds for save(), validate() and validateSync(), whichever of the two
 * flags is being changed.
 */
export function enforceDemoRules(schema: Schema) {
  schema.path("isPublished").validate({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validator(this: any, value: boolean) { return !(value && (this as { isDemo?: boolean }).isDemo); },
    message: MESSAGE,
  });
  schema.path("isDemo").validate({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validator(this: any, value: boolean) { return !(value && (this as { isPublished?: boolean }).isPublished); },
    message: MESSAGE,
  });
}
