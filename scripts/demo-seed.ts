/**
 * Idempotent demo seed. Re-running never duplicates records and NEVER overwrites existing ones
 * (every write is $setOnInsert), so edits and genuine conversions are preserved.
 */
import { MediaAsset } from "@/models/MediaAsset";
import { Project } from "@/models/Project";
import { Testimonial } from "@/models/Testimonial";
import { DEMO_MEDIA, DEMO_PROJECTS, DEMO_TESTIMONIALS, type DemoMediaKey } from "@/lib/demo/data";
import type { MediaIds } from "@/lib/demo/content";

export async function seedMedia(): Promise<MediaIds> {
  const ids: MediaIds = {};
  for (const m of DEMO_MEDIA) {
    const doc = await MediaAsset.findOneAndUpdate(
      { publicId: m.publicId },
      { $setOnInsert: { publicId: m.publicId, url: `/demo/${m.file}`, width: m.width, height: m.height, format: m.file.split(".").pop(), alt: m.alt, tags: [m.isDemo ? "demo" : "brand"], isDemo: m.isDemo } },
      { upsert: true, new: true },
    );
    ids[m.key as DemoMediaKey] = String(doc._id);
  }
  return ids;
}

export async function seedDemoRecords(ids: MediaIds, lists: { projects?: readonly { title: string; slug: string; category: string; media: DemoMediaKey; order: number }[]; testimonials?: readonly { authorName: string; authorRole: string; company: string; avatar: DemoMediaKey; order: number; quote: string }[] } = {}) {
  for (const p of lists.projects ?? DEMO_PROJECTS) {
    const r = await Project.updateOne({ slug: p.slug }, { $setOnInsert: {
      title: p.title, slug: p.slug, category: p.category, summary: "Sample project (demo).", thumbnailMediaId: ids[p.media] ?? null,
      order: p.order, isDemo: true, isPublished: false } }, { upsert: true });
    console.log(`  ${r.upsertedCount ? "+" : "="} demo project "${p.title}"`);
  }
  for (const t of lists.testimonials ?? DEMO_TESTIMONIALS) {
    const r = await Testimonial.updateOne({ authorName: t.authorName, quote: t.quote }, { $setOnInsert: {
      authorName: t.authorName, authorRole: t.authorRole, company: t.company, quote: t.quote, avatarMediaId: ids[t.avatar] ?? null,
      order: t.order, isDemo: true, isPublished: false } }, { upsert: true });
    console.log(`  ${r.upsertedCount ? "+" : "="} demo testimonial "${t.authorName}"`);
  }
}
