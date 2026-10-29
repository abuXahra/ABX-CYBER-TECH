import "server-only";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { collectionTag } from "@/lib/cms/collections";
import * as core from "./core";
import type { DemoKind } from "./core";

/** Dashboard-facing wrappers: every call re-checks the administrator, then invalidates the public cache. */
const bust = () => (["projects", "testimonials"] as const).forEach((n) => revalidateTag(collectionTag(n)));

export async function replaceDemoEntry(kind: DemoKind, id: string, patch: unknown) {
  const a = await requireAdmin(); await core.replaceDemo(a, kind, id, patch); bust();
}
export async function convertDemoEntry(kind: DemoKind, id: string, opts: { verified: boolean; patch?: unknown }) {
  const a = await requireAdmin(); const r = await core.convertDemoToGenuine(a, kind, id, opts); bust(); return r;
}
export async function publishEntry(kind: "project" | "testimonial", id: string) {
  const a = await requireAdmin(); await core.publishGenuine(a, kind, id); bust();
}
export async function unpublishEntry(kind: "project" | "testimonial", id: string) {
  const a = await requireAdmin(); await core.unpublish(a, kind, id); bust();
}
export async function removeDemoEntries(kind: DemoKind | "all" = "all") {
  const a = await requireAdmin(); const r = await core.removeDemo(a, kind); bust(); return r;
}
