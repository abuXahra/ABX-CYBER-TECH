import { commitPublished, getPointer } from "@/lib/publishing/core";
import { SEED_ACTOR } from "@/lib/actor";
import { SCOPE_SCHEMAS, type ContentMap, type Scope } from "@/lib/cms/scopes";
import { ContentRevision } from "@/models/ContentRevision";

export const stable = (v: unknown): string =>
  JSON.stringify(v, (_k, val) => (val && typeof val === "object" && !Array.isArray(val)
    ? Object.fromEntries(Object.entries(val as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))) : val));

export async function getLive<S extends Scope>(scope: S, key: string): Promise<{ content: ContentMap[S]; source?: string } | null> {
  const pointer = await getPointer({ scope, key });
  if (!pointer) return null;
  const rev = await ContentRevision.findById(pointer.publishedRevisionId).lean<{ content: unknown; source?: string }>();
  const parsed = SCOPE_SCHEMAS[scope].safeParse(JSON.parse(JSON.stringify(rev?.content)));
  return parsed.success ? { content: parsed.data, source: rev?.source } : null;
}

/** Publishes `desired` as a new revision unless identical; never overrides an administrator's edit without `force`. */
export async function applyContent(scope: Scope, key: string, desired: unknown, opts: { force: boolean; notes: string }) {
  const label = `${scope}:${key}`;
  const live = await getLive(scope, key);
  if (live && stable(live.content) === stable(SCOPE_SCHEMAS[scope].parse(desired))) return console.log(`  = ${label} already up to date`);
  if (live?.source === "admin" && !opts.force) return console.log(`  ! ${label} was last published by an administrator — skipped (use --force to override)`);
  const r = await commitPublished(SEED_ACTOR, { scope, key }, desired, { notes: opts.notes, action: "design.apply" });
  console.log(`  + ${label} published as v${r.version}`);
}
