import "server-only";
import type { PageSection } from "./sections";
import type { SiteSettings } from "./site";
import {
  getMediaMap, getPublishedFaqs, getPublishedProjects, getPublishedServices, getPublishedTestimonials,
} from "./collections";
import type { SectionContext } from "@/components/cms/context";

function mediaIdsOf(section: PageSection): string[] {
  const ids: (string | null)[] = [section.styles.background.imageMediaId];
  const c = section.content as Record<string, unknown>;
  for (const key of ["image", "mobileImage", "laptopScreen", "phoneScreen"]) {
    const v = c[key] as { mediaId?: string | null } | undefined;
    ids.push(v?.mediaId ?? null);
  }
  if (section.type === "credibility-band") section.content.logos.forEach((l) => ids.push(l.image.mediaId));
  if (section.type === "faq" && section.content.promo.image.mediaId) ids.push(section.content.promo.image.mediaId);
  return ids.filter((i): i is string => !!i);
}

/** Loads only the collections the enabled sections actually use. */
export async function loadSectionContext(sections: PageSection[], settings: SiteSettings, demo: boolean): Promise<SectionContext> {
  const active = sections.filter((s) => s.enabled);
  const has = (t: PageSection["type"]) => active.some((s) => s.type === t);
  const portfolio = active.find((s) => s.type === "portfolio-gallery");
  const projects = portfolio && portfolio.type === "portfolio-gallery" ? portfolio.content.limit : 0;

  const [services, projectsList, testimonials, faqs] = await Promise.all([
    has("services-grid") || has("hero") ? getPublishedServices() : [],
    projects ? getPublishedProjects(projects, demo) : [],
    has("testimonials") ? getPublishedTestimonials(demo) : [],
    has("faq") ? getPublishedFaqs() : [],
  ]);
  const thumbIds = [...projectsList.map((p) => p.thumbnailMediaId), ...testimonials.map((t) => t.avatarMediaId)].filter((i): i is string => !!i);
  const media = await getMediaMap([...active.flatMap(mediaIdsOf), ...thumbIds, ...(settings.logoMediaId ? [settings.logoMediaId] : [])], demo);
  return { settings, showDemo: demo, media, services, projects: projectsList, testimonials, faqs };
}
