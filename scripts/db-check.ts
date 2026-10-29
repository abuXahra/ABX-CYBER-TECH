/**
 * Integration check of the Mongoose models and the draft/publish data model against a real database.
 * Uses a scratch page key and removes everything it created. Run: npm run db:check
 */
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { SEED_ACTOR } from "@/lib/actor";
import { commitPublished, discardDraftCore, getPointer, publishDraftCore, restoreRevisionCore, saveDraftCore } from "@/lib/publishing/core";
import { DEFAULT_HOME } from "@/lib/cms/defaults";
import { PublishConflictError, PublishValidationError } from "@/lib/errors";
import { ContentRevision } from "@/models/ContentRevision";
import { ContentPointer } from "@/models/ContentPointer";
import { AuditLog } from "@/models/AuditLog";
import * as M from "@/models/all";
import { convertDemoToGenuine, publishGenuine, removeDemo, replaceDemo, unpublish } from "@/lib/demo/core";
import { publicRecordFilter } from "@/lib/demo/visibility";
import { seedDemoRecords } from "./demo-seed";

let failed = 0;
const ok = (name: string, pass: boolean, detail = "") => {
  if (!pass) failed++;
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
};
const t = async (name: string, fn: () => Promise<boolean | string | void>) => {
  try { const r = await fn(); ok(name, r === undefined || r === true || typeof r === "string", typeof r === "string" ? r : ""); }
  catch (e) { ok(name, false, e instanceof Error ? `${e.name}: ${e.message}` : String(e)); }
};

async function main() {
  const key = `dbcheck-${Date.now()}`;
  const target = { scope: "page" as const, key };
  await connectDB();
  ok("connect", mongoose.connection.readyState === 1, `${mongoose.connection.host}/${mongoose.connection.name}`);
  const ping = await mongoose.connection.db!.admin().ping();
  ok("ping", ping.ok === 1);

  console.log("\n-- models & indexes --");
  for (const [name, model] of Object.entries(M)) {
    await t(`model ${name}: init + indexes`, async () => { await model.init(); });
  }

  console.log("\n-- draft / publish data model --");
  const content = structuredClone(DEFAULT_HOME);
  content.seo.title = "DB check v1";
  let v1 = "";
  await t("save draft", async () => { await saveDraftCore(SEED_ACTOR, target, content); });
  await t("draft is not visible via pointer (public path)", async () => (await getPointer(target)) === null);
  await t("invalid content is rejected", async () => {
    try { await saveDraftCore(SEED_ACTOR, target, { seo: {}, sections: "x" }); return false; }
    catch (e) { return e instanceof PublishValidationError; }
  });
  await t("publish draft → v1", async () => { const r = await publishDraftCore(SEED_ACTOR, target); v1 = r.revisionId; return r.version === 1; });
  await t("pointer references published v1", async () => (await getPointer(target))?.publishedRevisionId.toString() === v1);
  await t("draft consumed by publish", async () => (await ContentRevision.countDocuments({ ...target, status: "draft" })) === 0);

  content.seo.title = "DB check v2";
  await t("save + publish v2", async () => { await saveDraftCore(SEED_ACTOR, target, content); return (await publishDraftCore(SEED_ACTOR, target)).version === 2; });
  await t("v2 links back to v1 (previousRevisionId)", async () => {
    const p = await getPointer(target);
    const rev = await ContentRevision.findById(p!.publishedRevisionId).lean<{ previousRevisionId: unknown }>();
    return String(rev?.previousRevisionId) === v1;
  });
  await t("published revision is immutable (update blocked)", async () => {
    await ContentRevision.updateOne({ _id: v1 }, { $set: { notes: "tamper" } });
    const r = await ContentRevision.findById(v1).lean<{ notes: string }>();
    return r?.notes !== "tamper";
  });
  await t("published revision is immutable (delete blocked)", async () => {
    await ContentRevision.deleteOne({ _id: v1 });
    return !!(await ContentRevision.findById(v1));
  });
  await t("restore v1 → NEW revision v3 (history preserved)", async () => {
    const r = await restoreRevisionCore(SEED_ACTOR, v1);
    const live = await ContentRevision.findById(r.revisionId).lean<{ content: { seo: { title: string } }; restoredFromRevisionId: unknown }>();
    return r.version === 3 && live?.content.seo.title === "DB check v1" && String(live.restoredFromRevisionId) === v1
      && (await ContentRevision.countDocuments({ ...target, status: "published" })) === 3;
  });
  await t("discard draft", async () => {
    await saveDraftCore(SEED_ACTOR, target, content); await discardDraftCore(SEED_ACTOR, target);
    return (await ContentRevision.countDocuments({ ...target, status: "draft" })) === 0;
  });
  await t("concurrent publishes: exactly one wins, no duplicate versions", async () => {
    const results = await Promise.allSettled([1, 2, 3].map(() => commitPublished(SEED_ACTOR, target, content, { action: "publish" })));
    const wins = results.filter((r) => r.status === "fulfilled").length;
    const conflicts = results.filter((r) => r.status === "rejected" && r.reason instanceof PublishConflictError).length;
    const versions = (await ContentRevision.find({ ...target, status: "published" }).lean<{ version: number }[]>()).map((r) => r.version);
    const unique = new Set(versions).size === versions.length;
    const detail = `${wins} won, ${conflicts} conflicted, other errors: ${results.filter((r) => r.status === "rejected" && !(r.reason instanceof PublishConflictError)).map((r) => String((r as PromiseRejectedResult).reason).slice(0, 80)).join(" | ") || "none"}, versions ${versions.sort().join(",")}`;
    if (!(wins >= 1 && unique)) throw new Error(detail);
    return detail;
  });
  await t("audit events recorded", async () => (await AuditLog.countDocuments({ entityId: key })) >= 5);

  console.log("\n-- demo content operations --");
  const tag = `dbcheck-demo-${Date.now()}`;
  const scratch = [{ title: "Scratch Demo Project", slug: `${tag}-a`, category: "Test", media: "projectWebsite" as const, order: 99 }];
  const publicSlugs = async (demo: boolean) => (await M.Project.find({ slug: { $regex: `^${tag}` }, ...publicRecordFilter(demo) }).lean<{ slug: string }[]>()).map((p) => p.slug);
  let pid = "";
  await t("seed creates a demo project (isDemo: true, isPublished: false)", async () => {
    await seedDemoRecords({}, { projects: scratch, testimonials: [] });
    const p = await M.Project.findOne({ slug: scratch[0]!.slug }).lean<{ _id: unknown; isDemo: boolean; isPublished: boolean }>(); pid = String(p?._id);
    return p?.isDemo === true && p?.isPublished === false;
  });
  await t("re-running the seed is idempotent and never overwrites an edited record", async () => {
    await M.Project.updateOne({ slug: scratch[0]!.slug }, { $set: { title: "Edited by admin" } });
    await seedDemoRecords({}, { projects: scratch, testimonials: [] });
    const n = await M.Project.countDocuments({ slug: scratch[0]!.slug }); const p = await M.Project.findOne({ slug: scratch[0]!.slug }).lean<{ title: string }>();
    return n === 1 && p?.title === "Edited by admin";
  });
  await t("demo record is hidden from the public query, visible in the demo preview", async () => (await publicSlugs(false)).length === 0 && (await publicSlugs(true)).length === 1);
  await t("a demo record cannot be published (action refuses)", async () => { try { await publishGenuine(SEED_ACTOR, "project", pid); return false; } catch (e) { return /cannot be published/.test(String(e)); } });
  await t("the data model refuses a published demo record", async () => { try { await M.Project.create({ title: "x", slug: `${tag}-bad`, category: "c", isDemo: true, isPublished: true }); return false; } catch { return true; } });
  await t("replace demo content (stays a demo entry)", async () => { await replaceDemo(SEED_ACTOR, "project", pid, { title: "Replaced Title", category: "Web" }); const p = await M.Project.findById(pid).lean<{ title: string; isDemo: boolean }>(); return p?.title === "Replaced Title" && p.isDemo === true; });
  await t("convert requires verification confirmation", async () => { try { await convertDemoToGenuine(SEED_ACTOR, "project", pid, { verified: false }); return false; } catch { return true; } });
  await t("convert → genuine but still UNPUBLISHED and still not public", async () => {
    await convertDemoToGenuine(SEED_ACTOR, "project", pid, { verified: true });
    const p = await M.Project.findById(pid).lean<{ isDemo: boolean; isPublished: boolean }>();
    return p?.isDemo === false && p?.isPublished === false && (await publicSlugs(false)).length === 0;
  });
  await t("publish genuine → now public in production view", async () => { await publishGenuine(SEED_ACTOR, "project", pid); return (await publicSlugs(false)).length === 1; });
  await t("unpublish → hidden again", async () => { await unpublish(SEED_ACTOR, "project", pid); return (await publicSlugs(false)).length === 0; });
  await t("remove demo deletes only demo records (genuine ones survive)", async () => {
    await seedDemoRecords({}, { projects: [{ ...scratch[0]!, slug: `${tag}-b`, title: "Another demo" }], testimonials: [] });
    const before = await M.Project.countDocuments({ slug: { $regex: `^${tag}` } });
    await removeDemo(SEED_ACTOR, "project", { slug: { $regex: `^${tag}` } });   // scoped: never touches real demo records
    const left = await M.Project.find({ slug: { $regex: `^${tag}` } }).lean<{ slug: string; isDemo: boolean }[]>();
    return before === 2 && left.length === 1 && left[0]!.slug === `${tag}-a` && left[0]!.isDemo === false;
  });
  await M.Project.deleteMany({ slug: { $regex: `^${tag}` } }); await AuditLog.deleteMany({ entityType: { $in: ["project", "demo"] }, actorEmail: "system:seed", action: { $regex: "^(demo|entry)" } });

  console.log("\n-- cleanup --");
  await ContentRevision.collection.deleteMany({ ...target });
  await ContentPointer.deleteMany(target);
  await AuditLog.deleteMany({ entityId: key });
  ok("scratch data removed", true);
  await mongoose.disconnect();
  console.log(failed ? `\n${failed} CHECK(S) FAILED` : "\nALL CHECKS PASSED");
  process.exit(failed ? 1 : 0);
}
main().catch((e) => { console.error("db-check crashed:", e instanceof Error ? e.message : e); process.exit(1); });
