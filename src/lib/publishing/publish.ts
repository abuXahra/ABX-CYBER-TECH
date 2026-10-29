import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { contentTag, type Scope } from "@/lib/cms/scopes";
import {
  discardDraftCore, publishDraftCore, restoreRevisionCore, saveDraftCore, type Target,
} from "./core";

/** Authenticated entry points for the dashboard. Every call re-checks the administrator. */

function invalidate(scope: Scope, key: string) {
  revalidateTag(contentTag(scope, key));
  if (scope !== "page") revalidatePath("/", "layout");
}

export async function saveDraft(target: Target & { content: unknown }) {
  const admin = await requireAdmin();
  return saveDraftCore(admin, target, target.content);
}

export async function discardDraft(target: Target) {
  const admin = await requireAdmin();
  await discardDraftCore(admin, target);
}

export async function publishDraft(target: Target & { notes?: string }) {
  const admin = await requireAdmin();
  const result = await publishDraftCore(admin, target, target.notes);
  invalidate(target.scope, target.key);
  return result;
}

export async function restoreRevision(revisionId: string, notes?: string) {
  const admin = await requireAdmin();
  const result = await restoreRevisionCore(admin, revisionId, notes);
  invalidate(result.scope, result.key);
  return result;
}
