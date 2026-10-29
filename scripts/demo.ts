/**
 * Demo-content administration from the command line (the dashboard UI arrives in a later phase).
 *   npm run demo -- list
 *   npm run demo -- remove                       delete all demo records + strip demo content from the homepage/settings
 *   npm run demo -- convert project <slug> --verified
 *   npm run demo -- convert testimonial "<author name>" --verified
 *   npm run demo -- publish project <slug>       publish a GENUINE (converted) entry
 */
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { SEED_ACTOR } from "@/lib/actor";
import { convertDemoToGenuine, listDemo, publishGenuine, removeDemo } from "@/lib/demo/core";
import { stripDemoFromHome, stripDemoFromSettings } from "@/lib/demo/content";
import { Project } from "@/models/Project";
import { Testimonial } from "@/models/Testimonial";
import { applyContent, getLive } from "./_apply";

const [cmd, kind, ref] = process.argv.slice(2);
const verified = process.argv.includes("--verified");

async function find(kind: string, ref: string) {
  const doc = kind === "project" ? await Project.findOne({ slug: ref }) : await Testimonial.findOne({ authorName: ref });
  if (!doc) throw new Error(`${kind} "${ref}" not found`);
  return String(doc._id);
}

async function main() {
  await connectDB();
  if (cmd === "list") console.log("demo records:", await listDemo());
  else if (cmd === "remove") {
    const { counts, removedMediaIds } = await removeDemo(SEED_ACTOR, "all");
    console.log("removed:", counts);
    const notes = "Remove demo content";
    const s = await getLive("settings", "site"); if (s) await applyContent("settings", "site", stripDemoFromSettings(s.content), { force: true, notes });
    const h = await getLive("page", "home"); if (h) await applyContent("page", "home", stripDemoFromHome(h.content, new Set(removedMediaIds)), { force: true, notes });
  } else if (cmd === "convert" && (kind === "project" || kind === "testimonial") && ref) {
    await convertDemoToGenuine(SEED_ACTOR, kind, await find(kind, ref), { verified }); console.log(`converted ${kind} "${ref}" to a genuine, UNPUBLISHED entry`);
  } else if (cmd === "publish" && (kind === "project" || kind === "testimonial") && ref) {
    await publishGenuine(SEED_ACTOR, kind, await find(kind, ref)); console.log(`published ${kind} "${ref}"`);
  } else { console.log("usage: npm run demo -- list | remove | convert <project|testimonial> <ref> --verified | publish <project|testimonial> <ref>"); process.exitCode = 1; }
  await mongoose.disconnect();
}
main().catch(async (e) => { console.error("demo failed:", e instanceof Error ? e.message : e); await mongoose.disconnect().catch(() => {}); process.exit(1); });
