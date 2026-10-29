/**
 * Applies the approved homepage design to the database:
 *  - seeds media records for the approved logo (genuine) and the sample imagery (demo)
 *  - seeds demo projects / testimonials (isDemo: true, isPublished: false) — idempotent, never overwrites
 *  - rewords untouched seed FAQs to the approved wording
 *  - publishes theme, navigation, settings and homepage as NEW revisions via the publishing core
 *    (history kept; skipped when identical; skipped when an administrator published the live revision, unless --force)
 * Run: npm run design:apply [-- --no-demo] [-- --force]
 */
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { DEFAULT_HOME, DEFAULT_NAVIGATION, DEFAULT_SETTINGS } from "@/lib/cms/defaults";
import { DEFAULT_THEME } from "@/lib/cms/theme";
import { addBrandToSettings, addDemoToHome, addDemoToSettings } from "@/lib/demo/content";
import { Faq } from "@/models/Faq";
import { Service } from "@/models/Service";
import { SEED_FAQS } from "./seed-data";
import { applyContent } from "./_apply";
import { seedDemoRecords, seedMedia } from "./demo-seed";

const force = process.argv.includes("--force");
const withDemo = !process.argv.includes("--no-demo");

/** Earlier seed wording → approved wording. Only entries still holding the original seed answer are touched. */
const FAQ_RENAMES: { from: string; fromAnswer: string; to: number }[] = [
  { from: "How long does a project take?", fromAnswer: "It depends on the scope, features and content involved. After you tell us about your project through the Contact Us page, we agree a realistic schedule with you before work begins.", to: 1 },
  { from: "Do you work with clients outside Abuja?", fromAnswer: "Yes. We are based in Abuja, and we can collaborate with clients elsewhere remotely. Contact us to discuss your project.", to: 2 },
  { from: "Can you redesign an existing website?", fromAnswer: "Yes. Our Website Redesign service gives an existing website a fresh, professional look while keeping what already works.", to: 3 },
];

async function migrateFaqs() {
  for (const r of FAQ_RENAMES) {
    const t = SEED_FAQS[r.to]!;
    const res = await Faq.updateOne({ question: r.from, answer: r.fromAnswer }, { $set: { question: t.question, answer: t.answer } });
    console.log(`  ${res.modifiedCount ? "~" : "="} faq "${t.question}"${res.modifiedCount ? " (reworded)" : ""}`);
  }
}

async function main() {
  await connectDB();
  console.log(`Applying design to "${mongoose.connection.name}"${withDemo ? " (with demo content)" : ""}`);
  console.log("Media"); const ids = await seedMedia(); console.log(`  ${Object.keys(ids).length} media records ready`);
  console.log("FAQs"); await migrateFaqs();
  const ic = await Service.updateOne({ slug: "website-design", icon: "palette" }, { $set: { icon: "tag" } });
  console.log(`  ${ic.modifiedCount ? "~" : "="} service icon for Website Design`);
  if (withDemo) { console.log("Demo records (isDemo: true, isPublished: false)"); await seedDemoRecords(ids); }
  console.log("Published content");
  const notes = withDemo ? "Apply approved homepage design (with demo content)" : "Apply approved homepage design";
  await applyContent("theme", "global", DEFAULT_THEME, { force, notes });
  await applyContent("navigation", "main", DEFAULT_NAVIGATION, { force, notes });
  await applyContent("settings", "site", withDemo ? addDemoToSettings(DEFAULT_SETTINGS, ids) : addBrandToSettings(DEFAULT_SETTINGS, ids), { force, notes });
  await applyContent("page", "home", withDemo ? addDemoToHome(DEFAULT_HOME, ids) : DEFAULT_HOME, { force, notes });
  await mongoose.disconnect();
  console.log("Done. Delete the .next folder (or restart the server) so cached pages refresh.");
  console.log("Demo content is visible in development only (see SHOW_DEMO_CONTENT in .env.example).");
}
main().catch(async (e) => { console.error("design:apply failed:", e instanceof Error ? e.message : e); await mongoose.disconnect().catch(() => {}); process.exit(1); });
