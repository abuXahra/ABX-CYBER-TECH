import "server-only";
import { z } from "zod";
import type { Model } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { writeAudit } from "@/lib/auth/audit";
import type { Actor } from "@/lib/actor";
import { MediaAsset } from "@/models/MediaAsset";
import { Project } from "@/models/Project";
import { Testimonial } from "@/models/Testimonial";
import { NotFoundError } from "@/lib/errors";

/**
 * Administrator operations for demo (sample) content. Authorization-free core: the dashboard wrappers in
 * actions.ts call requireAdmin() first. None of these require editing React source files.
 */
export type DemoKind = "project" | "testimonial" | "media";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MODELS: Record<DemoKind, Model<any>> = { project: Project, testimonial: Testimonial, media: MediaAsset };

const text = (n: number) => z.string().trim().max(n);
const PATCH: Record<DemoKind, z.ZodTypeAny> = {
  project: z.object({ title: text(120).min(1), category: text(80).min(1), summary: text(300), projectUrl: text(500), thumbnailMediaId: z.string().nullable(), technologies: z.array(text(40)).max(20), featured: z.boolean() }).partial().strict(),
  testimonial: z.object({ authorName: text(80).min(1), authorRole: text(120), company: text(120), quote: text(800).min(1), avatarMediaId: z.string().nullable() }).partial().strict(),
  media: z.object({ alt: text(200), tags: z.array(text(40)).max(20) }).partial().strict(),
};

async function load(kind: DemoKind, id: string) {
  await connectDB();
  const doc = await MODELS[kind].findById(id);
  if (!doc) throw new NotFoundError(kind);
  return doc;
}

export async function listDemo() {
  await connectDB();
  const [projects, testimonials, media] = await Promise.all([
    Project.countDocuments({ isDemo: true }), Testimonial.countDocuments({ isDemo: true }), MediaAsset.countDocuments({ isDemo: true }),
  ]);
  return { projects, testimonials, media };
}

/** Replace the contents of a demo entry (it stays a demo entry until converted). */
export async function replaceDemo(actor: Actor, kind: DemoKind, id: string, patch: unknown) {
  const data = PATCH[kind].parse(patch);
  const doc = await load(kind, id);
  if (!doc.isDemo) throw new Error("Only demo entries can be replaced with this action; edit genuine entries normally.");
  doc.set(data); await doc.save();
  await writeAudit(actor, { action: "demo.replace", entityType: kind, entityId: id });
}

/**
 * Convert a demo entry into a genuine entry AFTER verification. The caller must confirm `verified: true`.
 * The entry becomes unpublished (isPublished=false); publish it explicitly with publishGenuine().
 * References to still-demo media are cleared so genuine records never depend on sample images.
 */
export async function convertDemoToGenuine(actor: Actor, kind: DemoKind, id: string, opts: { verified: boolean; patch?: unknown }) {
  if (opts.verified !== true) throw new Error("Confirm that the information has been verified before converting a demo entry.");
  const doc = await load(kind, id);
  if (!doc.isDemo) return { alreadyGenuine: true };
  if (opts.patch) doc.set(PATCH[kind].parse(opts.patch));
  for (const field of ["thumbnailMediaId", "avatarMediaId"] as const) {
    const ref = doc.get(field);
    if (ref && (await MediaAsset.exists({ _id: ref, isDemo: true }))) doc.set(field, null);
  }
  doc.set({ isDemo: false, isPublished: false });
  await doc.save();
  await writeAudit(actor, { action: "demo.convert", entityType: kind, entityId: id });
  return { alreadyGenuine: false };
}

export async function publishGenuine(actor: Actor, kind: Exclude<DemoKind, "media">, id: string) {
  const doc = await load(kind, id);
  if (doc.isDemo) throw new Error("Demo content cannot be published. Convert it to a genuine entry after verification first.");
  doc.set({ isPublished: true, publishedAt: new Date() });
  await doc.save();
  await writeAudit(actor, { action: "entry.publish", entityType: kind, entityId: id });
}

export async function unpublish(actor: Actor, kind: Exclude<DemoKind, "media">, id: string) {
  const doc = await load(kind, id);
  doc.set({ isPublished: false }); await doc.save();
  await writeAudit(actor, { action: "entry.unpublish", entityType: kind, entityId: id });
}

/**
 * Deletes demo records (all kinds, or one). Genuine records are never touched. Returns the removed media IDs.
 * `where` narrows the deletion further (used by tests so they only ever remove their own scratch records).
 */
export async function removeDemo(actor: Actor, kind: DemoKind | "all" = "all", where: Record<string, unknown> = {}) {
  await connectDB();
  const kinds: DemoKind[] = kind === "all" ? ["project", "testimonial", "media"] : [kind];
  const demoMedia = (await MediaAsset.find({ isDemo: true, ...where }).select("_id").lean<{ _id: unknown }[]>()).map((m) => String(m._id));
  const counts: Record<string, number> = {};
  for (const k of kinds) counts[k] = (await MODELS[k].deleteMany({ isDemo: true, ...where })).deletedCount ?? 0;
  await writeAudit(actor, { action: "demo.remove", entityType: "demo", summary: JSON.stringify(counts) });
  return { counts, removedMediaIds: kinds.includes("media") ? demoMedia : [] };
}
