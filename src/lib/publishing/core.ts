import "server-only";
import type { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { writeAudit } from "@/lib/auth/audit";
import type { Actor } from "@/lib/actor";
import { ContentRevision } from "@/models/ContentRevision";
import { ContentPointer } from "@/models/ContentPointer";
import { publishBlockers, SCOPE_SCHEMAS, type Scope } from "@/lib/cms/scopes";
import { NotFoundError, PublishConflictError, PublishValidationError } from "@/lib/errors";

/**
 * Authorization-free publishing core. It is NEVER called directly from a request:
 * publish.ts wraps it with requireAdmin() + cache invalidation, and scripts/seed.ts
 * calls it as the system actor. Keeping one implementation guarantees the seed uses
 * exactly the same immutable-revision + pointer-swap path as the dashboard.
 */
export type Target = { scope: Scope; key: string };

export function parseContent<S extends Scope>(scope: S, content: unknown) {
  const result = SCOPE_SCHEMAS[scope].safeParse(content);
  if (!result.success) {
    throw new PublishValidationError(result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })));
  }
  return result.data;
}

const isDuplicateKey = (e: unknown) => typeof e === "object" && e !== null && (e as { code?: number }).code === 11000;

export async function saveDraftCore(actor: Actor, target: Target, rawContent: unknown) {
  const content = parseContent(target.scope, rawContent);
  await connectDB();
  const draft = await ContentRevision.findOneAndUpdate(
    { ...target, status: "draft" },
    { $set: { content, createdBy: actor.id, source: actor.id ? "admin" : "system" }, $setOnInsert: { ...target, status: "draft" } },
    { upsert: true, new: true },
  );
  await writeAudit(actor, { action: "draft.save", entityType: target.scope, entityId: target.key });
  return { id: String(draft._id) };
}

export async function discardDraftCore(actor: Actor, target: Target) {
  await connectDB();
  await ContentRevision.deleteOne({ ...target, status: "draft" });
  await writeAudit(actor, { action: "draft.discard", entityType: target.scope, entityId: target.key });
}

export async function getPointer(target: Target) {
  await connectDB();
  return ContentPointer.findOne(target).lean<{ publishedRevisionId: Types.ObjectId; publishedVersion: number }>();
}

/** validate → insert immutable revision (invisible) → guarded pointer swap → audit. */
export async function commitPublished(
  actor: Actor,
  target: Target,
  rawContent: unknown,
  opts: { notes?: string; restoredFrom?: Types.ObjectId | string | null; action: string },
) {
  const content = parseContent(target.scope, rawContent);
  const blockers = publishBlockers(target.scope, content);
  if (blockers.length) throw new PublishValidationError(blockers.map((b) => ({ path: b.pair, message: b.message })));

  await connectDB();
  const pointer = await getPointer(target);
  const previousId = pointer?.publishedRevisionId ?? null;
  const version = (pointer?.publishedVersion ?? 0) + 1;

  let revisionId: Types.ObjectId;
  try {
    const revision = await ContentRevision.create({
      ...target, status: "published", version, versionKey: `${target.scope}:${target.key}:${version}`, content,
      previousRevisionId: previousId, restoredFromRevisionId: opts.restoredFrom ?? null,
      createdBy: actor.id, source: actor.id ? "admin" : "system",
      notes: opts.notes ?? "", publishedAt: new Date(),
    });
    revisionId = revision._id as Types.ObjectId;
  } catch (e) {
    if (isDuplicateKey(e)) throw new PublishConflictError();
    throw e;
  }

  let swapped = false;
  if (!pointer) {
    try {
      await ContentPointer.create({ ...target, publishedRevisionId: revisionId, publishedVersion: version });
      swapped = true;
    } catch (e) {
      if (!isDuplicateKey(e)) throw e;
    }
  } else {
    const res = await ContentPointer.updateOne(
      { ...target, publishedRevisionId: previousId },
      { $set: { publishedRevisionId: revisionId, publishedVersion: version } },
    );
    swapped = res.modifiedCount === 1;
  }
  if (!swapped) {
    // Lost a race: drop our never-visible revision (bypasses the immutability hook deliberately).
    await ContentRevision.collection.deleteOne({ _id: revisionId });
    throw new PublishConflictError();
  }

  await writeAudit(actor, {
    action: opts.action, entityType: target.scope, entityId: target.key, summary: `v${version}`,
    meta: { revisionId: String(revisionId), restoredFrom: opts.restoredFrom ? String(opts.restoredFrom) : null },
  });
  return { revisionId: String(revisionId), version };
}

export async function publishDraftCore(actor: Actor, target: Target, notes?: string) {
  await connectDB();
  const draft = await ContentRevision.findOne({ ...target, status: "draft" }).lean<{ content: unknown }>();
  if (!draft) throw new NotFoundError("Draft");
  const result = await commitPublished(actor, target, draft.content, { notes, action: "publish" });
  await ContentRevision.deleteOne({ ...target, status: "draft" });
  return result;
}

export async function restoreRevisionCore(actor: Actor, revisionId: string, notes?: string) {
  await connectDB();
  const source = await ContentRevision.findOne({ _id: revisionId, status: "published" })
    .lean<{ _id: Types.ObjectId; scope: Scope; key: string; content: unknown; version: number }>();
  if (!source) throw new NotFoundError("Revision");
  const target = { scope: source.scope, key: source.key };
  const result = await commitPublished(actor, target, source.content, {
    notes: notes ?? `Restored from v${source.version}`, restoredFrom: source._id, action: "restore",
  });
  return { ...result, ...target };
}
