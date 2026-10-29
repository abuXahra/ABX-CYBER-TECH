import type { Metadata } from "next";
import { getPublishedContent, getPublishedPage } from "@/lib/cms/content";
import { isDemoContentVisible } from "@/lib/demo/visibility";
import { loadSectionContext } from "@/lib/cms/section-data";
import { ContentUnavailableError } from "@/lib/errors";
import { ContentUnavailable } from "@/components/website/content-unavailable";
import { SectionRenderer } from "@/components/cms/section-renderer";

// Rendered per request from cached, tag-invalidated reads: a database outage can never be baked
// into a statically generated page, and publishing takes effect immediately with no redeploy.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  let content;
  try {
    ({ content } = await getPublishedPage("home"));
  } catch (err) {
    // Metadata errors bypass error.tsx, so degrade here; the page body below still fails visibly.
    if (err instanceof ContentUnavailableError) return { title: "Temporarily unavailable", robots: { index: false, follow: false } };
    throw err;
  }
  return {
    title: content.seo.title ? { absolute: content.seo.title } : undefined,
    description: content.seo.description || undefined,
    robots: content.seo.noindex ? { index: false, follow: false } : undefined,
  };
}

export default async function HomePage() {
  try {
    const [{ content }, settings] = await Promise.all([getPublishedPage("home"), getPublishedContent("settings", "site")]);
    const ctx = await loadSectionContext(content.sections, settings, isDemoContentVisible());
    return (
      <main id="main">
        <SectionRenderer sections={content.sections} ctx={ctx} />
      </main>
    );
  } catch (err) {
    // Explicit, logged outage state. Deliberately NOT an empty page and NOT silently-substituted defaults.
    console.error("[home] content unavailable", err instanceof Error ? err.message : err);
    return <ContentUnavailable />;
  }
}
