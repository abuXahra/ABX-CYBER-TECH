import "server-only";
import { isValidObjectId } from "mongoose";
import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { Faq } from "@/models/Faq";
import { MediaAsset } from "@/models/MediaAsset";
import { Project } from "@/models/Project";
import { Service } from "@/models/Service";
import { Testimonial } from "@/models/Testimonial";
import { publicRecordFilter } from "@/lib/demo/visibility";

/** Minimal public projections: only published records, only fields the website renders. */
export type ServiceView = { id: string; name: string; slug: string; shortDescription: string; icon: string };
export type ProjectView = { id: string; title: string; slug: string; category: string; thumbnailMediaId: string | null };
export type TestimonialView = { id: string; authorName: string; authorRole: string; company: string; quote: string; avatarMediaId: string | null };
export type FaqView = { id: string; question: string; answer: string };
export type MediaView = { id: string; url: string; width: number; height: number; alt: string; focal: { x: number; y: number }; isDemo: boolean };

const TTL = 300;
export const collectionTag = (name: "services" | "projects" | "testimonials" | "faqs") => `collection:${name}`;
const sid = (v: unknown) => String(v);

/** Errors propagate (never swallowed into an empty list) so outages are visible, not silent. */
export const getPublishedServices = unstable_cache(
  async (): Promise<ServiceView[]> => {
    await connectDB();
    const rows = await Service.find({ status: "published" }).sort({ order: 1, createdAt: 1 }).lean();
    return rows.map((r) => ({ id: sid(r._id), name: r.name, slug: r.slug, shortDescription: r.shortDescription, icon: r.icon ?? "globe" }));
  },
  ["collection", "services"], { tags: [collectionTag("services")], revalidate: TTL },
);

/** `demo` = whether sample records may be included (development preview only). It is part of the cache key. */
export const getPublishedProjects = unstable_cache(
  async (limit: number, demo: boolean): Promise<ProjectView[]> => {
    await connectDB();
    const rows = await Project.find(publicRecordFilter(demo)).sort({ featured: -1, order: 1, publishedAt: -1 }).limit(limit).lean();
    return rows.map((r) => ({ id: sid(r._id), title: r.title, slug: r.slug, category: r.category, thumbnailMediaId: r.thumbnailMediaId ?? null }));
  },
  ["collection", "projects"], { tags: [collectionTag("projects")], revalidate: TTL },
);

export const getPublishedTestimonials = unstable_cache(
  async (demo: boolean): Promise<TestimonialView[]> => {
    await connectDB();
    const rows = await Testimonial.find(publicRecordFilter(demo)).sort({ order: 1, createdAt: 1 }).lean();
    return rows.map((r) => ({ id: sid(r._id), authorName: r.authorName, authorRole: r.authorRole ?? "", company: r.company ?? "", quote: r.quote, avatarMediaId: r.avatarMediaId ?? null }));
  },
  ["collection", "testimonials"], { tags: [collectionTag("testimonials")], revalidate: TTL },
);

export const getPublishedFaqs = unstable_cache(
  async (): Promise<FaqView[]> => {
    await connectDB();
    const rows = await Faq.find({ status: "published" }).sort({ order: 1, createdAt: 1 }).lean();
    return rows.map((r) => ({ id: sid(r._id), question: r.question, answer: r.answer }));
  },
  ["collection", "faqs"], { tags: [collectionTag("faqs")], revalidate: TTL },
);

/** Demo media (sample imagery) is resolved only when `demo` is true; otherwise components use their built-in fallback art. */
export async function getMediaMap(ids: string[], demo = false): Promise<Record<string, MediaView>> {
  const valid = [...new Set(ids)].filter((i) => isValidObjectId(i));
  if (valid.length === 0) return {};
  await connectDB();
  const rows = await MediaAsset.find({ _id: { $in: valid }, ...(demo ? {} : { isDemo: { $ne: true } }) }).lean();
  return Object.fromEntries(
    rows.map((r) => [sid(r._id), { id: sid(r._id), url: r.url, width: r.width ?? 1200, height: r.height ?? 800, alt: r.alt ?? "", focal: { x: r.focal?.x ?? 0.5, y: r.focal?.y ?? 0.5 }, isDemo: !!r.isDemo }]),
  );
}
