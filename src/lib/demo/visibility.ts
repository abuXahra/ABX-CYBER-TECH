/**
 * Demo (sample) content is visible ONLY in development / explicitly-enabled demo deployments.
 * It never appears on the public production site as verified business information.
 *   SHOW_DEMO_CONTENT=true   → force on  (e.g. a private staging/demo deployment)
 *   SHOW_DEMO_CONTENT=false  → force off (e.g. to preview the production view locally)
 *   unset                    → on in development, off in production
 */
export function isDemoContentVisible(env: Record<string, string | undefined> = process.env): boolean {
  if (env.SHOW_DEMO_CONTENT === "true") return true;
  if (env.SHOW_DEMO_CONTENT === "false") return false;
  return env.NODE_ENV !== "production";
}

/** MongoDB filter for public collection queries (projects, testimonials, media). */
export function publicRecordFilter(demoVisible: boolean, kind: "published" | "any" = "published") {
  const genuine = kind === "published" ? { isPublished: true, isDemo: { $ne: true } } : { isDemo: { $ne: true } };
  return demoVisible ? { $or: [genuine, { isDemo: true }] } : genuine;
}
