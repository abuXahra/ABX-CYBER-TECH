/**
 * Idempotent seed. Safe to run any number of times:
 *  - published CMS content is created ONLY when no pointer exists, via the real publishing core
 *  - services / FAQs / pages are inserted with $setOnInsert, so administrator edits are never overwritten
 * Run: npm run seed
 */
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { SEED_ACTOR } from "@/lib/actor";
import { commitPublished, getPointer } from "@/lib/publishing/core";
import { DEFAULT_HOME, DEFAULT_NAVIGATION, DEFAULT_SETTINGS } from "@/lib/cms/defaults";
import { DEFAULT_THEME } from "@/lib/cms/theme";
import { PublishConflictError } from "@/lib/errors";
import type { Scope } from "@/lib/cms/scopes";
import { Faq } from "@/models/Faq";
import { Page } from "@/models/Page";
import { Service } from "@/models/Service";
import { SEED_FAQS, SEED_PAGES, SEED_SERVICES } from "./seed-data";

async function seedContent(scope: Scope, key: string, content: unknown) {
  if (await getPointer({ scope, key })) return console.log(`  = ${scope}:${key} already published — skipped`);
  try {
    const r = await commitPublished(SEED_ACTOR, { scope, key }, content, { notes: "Initial seed", action: "seed.publish" });
    console.log(`  + ${scope}:${key} published as v${r.version}`);
  } catch (e) {
    if (e instanceof PublishConflictError) return console.log(`  = ${scope}:${key} published concurrently — skipped`);
    throw e;
  }
}

async function main() {
  await connectDB();
  console.log(`Seeding database "${mongoose.connection.name}" on ${mongoose.connection.host}`);

  console.log("Collections");
  for (const [slug, title] of SEED_PAGES) await Page.updateOne({ slug }, { $setOnInsert: { slug, title, system: true } }, { upsert: true });
  for (const s of SEED_SERVICES) {
    const r = await Service.updateOne({ slug: s.slug }, { $setOnInsert: { ...s, features: [...s.features], status: "published" } }, { upsert: true });
    console.log(`  ${r.upsertedCount ? "+" : "="} service ${s.slug}`);
  }
  for (const f of SEED_FAQS) {
    const r = await Faq.updateOne({ question: f.question }, { $setOnInsert: { ...f, status: "published" } }, { upsert: true });
    console.log(`  ${r.upsertedCount ? "+" : "="} faq "${f.question}"`);
  }

  console.log("Published CMS content (via the publishing core)");
  await seedContent("theme", "global", DEFAULT_THEME);
  await seedContent("settings", "site", DEFAULT_SETTINGS);
  await seedContent("navigation", "main", DEFAULT_NAVIGATION);
  await seedContent("page", "home", DEFAULT_HOME);

  console.log("No testimonials, projects, client logos or contact details were created.");
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error("Seed failed:", e instanceof Error ? e.message : e);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
