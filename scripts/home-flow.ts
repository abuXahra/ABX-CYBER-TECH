/** Dev utility used to verify the draft/publish/restore flow end-to-end: draft | publish | restore */
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { SEED_ACTOR } from "@/lib/actor";
import { getPointer, publishDraftCore, restoreRevisionCore, saveDraftCore } from "@/lib/publishing/core";
import { ContentRevision } from "@/models/ContentRevision";
import { pageContentSchema } from "@/lib/cms/sections";

const [mode, headline] = [process.argv[2], process.argv[3] ?? ""];
const target = { scope: "page" as const, key: "home" };
async function main() {
  await connectDB();
  if (mode === "draft") {
    const p = await getPointer(target);
    const live = await ContentRevision.findById(p!.publishedRevisionId).lean<{ content: unknown }>();
    const c = pageContentSchema.parse(JSON.parse(JSON.stringify(live!.content)));
    const hero = c.sections.find((s) => s.type === "hero")!;
    if (hero.type === "hero") { hero.content.headline = headline; hero.content.headlineHighlight = ""; }
    await saveDraftCore(SEED_ACTOR, target, c);
    console.log("draft saved:", headline);
  } else if (mode === "publish") {
    console.log("published", await publishDraftCore(SEED_ACTOR, target, "flow check"));
  } else if (mode === "restore") {
    const v1 = await ContentRevision.findOne({ ...target, status: "published", version: 1 }).lean<{ _id: unknown }>();
    console.log("restored", await restoreRevisionCore(SEED_ACTOR, String(v1!._id)));
  }
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
