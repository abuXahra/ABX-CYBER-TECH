import "server-only";
import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { ContentPointer } from "@/models/ContentPointer";
import { ContentRevision } from "@/models/ContentRevision";
import { contentTag, getDefaultContent, SCOPE_SCHEMAS, type ContentMap, type Scope } from "./scopes";
import { ContentUnavailableError, NotPublishedError } from "@/lib/errors";

type Raw = { content: unknown; version: number };

const plain = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const isNotPublished = (e: unknown) => e instanceof Error && e.name === "NotPublishedError";

/**
 * Follows the active pointer to its immutable published revision. Throws NotPublishedError when
 * nothing is published, and lets database errors propagate. Thrown errors are never cached.
 */
function readPublished(scope: Scope, key: string): Promise<Raw> {
  return unstable_cache(
    async (): Promise<Raw> => {
      await connectDB();
      const pointer = await ContentPointer.findOne({ scope, key }).lean<{ publishedRevisionId: unknown; publishedVersion: number }>();
      if (!pointer) throw new NotPublishedError(`${scope}:${key}`);
      const revision = await ContentRevision.findOne({ _id: pointer.publishedRevisionId, status: "published" })
        .lean<{ content: unknown; version: number }>();
      if (!revision) throw new Error(`Pointer for ${scope}:${key} references a missing revision`);
      return { content: plain(revision.content), version: revision.version };
    },
    ["cms", scope, key],
    { tags: [contentTag(scope, key)], revalidate: 3600 },
  )();
}

export type PublishedPage = {
  content: ContentMap["page"];
  version: number | null;
  /** "defaults" means nothing is published yet (seed not run) — logged loudly, never hidden. */
  source: "published" | "defaults";
};

/**
 * PUBLIC page read. A database failure or corrupt content THROWS (ContentUnavailableError) so the
 * route's error boundary shows an honest "temporarily unavailable" page — it is never rendered as
 * an empty or default homepage.
 */
export async function getPublishedPage(slug: string): Promise<PublishedPage> {
  let raw: Raw;
  try {
    raw = await readPublished("page", slug);
  } catch (err) {
    if (isNotPublished(err)) {
      console.warn(`[cms] page:${slug} has no published revision; serving built-in defaults. Run \`npm run seed\`.`);
      return { content: getDefaultContent("page", slug), version: null, source: "defaults" };
    }
    console.error(`[cms] database error while loading page:${slug}`, err instanceof Error ? err.message : err);
    throw new ContentUnavailableError(`page "${slug}"`, { cause: err });
  }
  const parsed = SCOPE_SCHEMAS.page.safeParse(raw.content);
  if (!parsed.success) {
    console.error(`[cms] published page:${slug} v${raw.version} failed validation`, parsed.error.issues[0]);
    throw new ContentUnavailableError(`page "${slug}" (stored content is invalid)`);
  }
  return { content: parsed.data, version: raw.version, source: "published" };
}

/**
 * Global settings (theme, navigation, site settings). A failure here degrades to safe defaults so one
 * outage cannot blank every page's chrome — but it is always logged, and page content never does this.
 */
export async function getPublishedContent<S extends Exclude<Scope, "page">>(scope: S, key: string): Promise<ContentMap[S]> {
  try {
    const raw = await readPublished(scope, key);
    const parsed = SCOPE_SCHEMAS[scope].safeParse(raw.content);
    if (parsed.success) return parsed.data;
    console.error(`[cms] published ${scope}:${key} invalid – using defaults`, parsed.error.issues[0]);
  } catch (err) {
    if (isNotPublished(err)) console.warn(`[cms] ${scope}:${key} not published; using defaults`);
    else console.error(`[cms] could not load ${scope}:${key}; using defaults`, err instanceof Error ? err.message : err);
  }
  return getDefaultContent(scope, key);
}

/** ADMIN-ONLY read for previews: the draft, else the live version, else defaults. Never cached. */
export async function getDraftContent<S extends Scope>(scope: S, key: string): Promise<ContentMap[S]> {
  await requireAdmin();
  await connectDB();
  const parse = (raw: unknown) => {
    const r = SCOPE_SCHEMAS[scope].safeParse(plain(raw));
    return r.success ? r.data : getDefaultContent(scope, key);
  };
  const draft = await ContentRevision.findOne({ scope, key, status: "draft" }).lean<{ content: unknown }>();
  if (draft) return parse(draft.content);
  const pointer = await ContentPointer.findOne({ scope, key }).lean<{ publishedRevisionId: unknown }>();
  const live = pointer ? await ContentRevision.findById(pointer.publishedRevisionId).lean<{ content: unknown }>() : null;
  return live ? parse(live.content) : getDefaultContent(scope, key);
}
