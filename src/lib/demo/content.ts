/** Pure helpers that add / hide / strip demo content inside CMS documents (page + settings). No server imports. */
import type { PageContent } from "@/lib/cms/sections";
import type { SiteSettings } from "@/lib/cms/site";
import { DEMO_BADGE, DEMO_CONTACT, DEMO_LOGOS, DEMO_LOGOS_HEADING, type DemoMediaKey } from "./data";

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const noImage = { mediaId: null, alt: "", decorative: false };
const emptyContact: SiteSettings["demoContact"] = { phone: "", contactEmail: "", website: "", social: { facebook: "", x: "", linkedin: "", instagram: "", youtube: "" } };

export type MediaIds = Partial<Record<DemoMediaKey, string>>;

/** Adds the sample content + sample imagery to a homepage document. */
export function addDemoToHome(home: PageContent, ids: MediaIds): PageContent {
  const out = clone(home);
  const img = (key: DemoMediaKey, alt: string) => (ids[key] ? { mediaId: ids[key]!, alt, decorative: false } : { ...noImage });
  for (const s of out.sections) {
    if (s.type === "hero") { s.content.image = img("heroDevices", "Laptop and smartphone showing a modern website and mobile app"); s.content.caption = s.content.caption || "Websites, Mobile Apps & Digital Solutions"; }
    if (s.type === "about-split") { s.content.image = img("aboutWorkspace", "Developer workspace with a laptop showing code and an ABX mug"); }
    if (s.type === "credibility-band") {
      s.variant = "logos"; s.content.logosHeading = DEMO_LOGOS_HEADING;
      s.content.logos = DEMO_LOGOS.map((l) => ({ name: l.name, icon: l.icon, image: { ...noImage }, isDemo: true }));
    }
    if (s.type === "faq") { Object.assign(s.content.promo, DEMO_BADGE); s.content.promo.image = img("faqContact", "Developer working on a laptop"); }
  }
  return out;
}

/** The approved logo lockups are genuine brand assets (not demo): wired into settings regardless of demo mode. */
export function addBrandToSettings(s: SiteSettings, ids: MediaIds): SiteSettings {
  const out = clone(s);
  if (ids.logoHeader && !out.logoMediaId) out.logoMediaId = ids.logoHeader;
  if (ids.logoFooter && !out.footerLogoMediaId) out.footerLogoMediaId = ids.logoFooter;
  return out;
}

export function addDemoToSettings(s: SiteSettings, ids: MediaIds): SiteSettings {
  const out = addBrandToSettings(s, ids);
  out.demoContact = clone(DEMO_CONTACT) as SiteSettings["demoContact"];
  return out;
}

/** Removes demo-only content. Real (non-demo) logos, contact details and images are preserved. */
export function stripDemoFromHome(home: PageContent, demoMediaIds: ReadonlySet<string> = new Set()): PageContent {
  const out = clone(home);
  const drop = <T extends { mediaId: string | null }>(i: T): T => (i.mediaId && demoMediaIds.has(i.mediaId) ? { ...i, mediaId: null } : i);
  for (const s of out.sections) {
    if (s.type === "hero") { s.content.image = drop(s.content.image); s.content.laptopScreen = drop(s.content.laptopScreen); s.content.phoneScreen = drop(s.content.phoneScreen); }
    if (s.type === "about-split") s.content.image = drop(s.content.image);
    if (s.type === "credibility-band") {
      s.content.logos = s.content.logos.filter((l) => !l.isDemo);
      if (s.content.logos.length === 0) { s.content.logosHeading = ""; if (s.variant === "logos") s.variant = "capabilities"; }
    }
    if (s.type === "faq") { s.content.promo.demoBadgeTitle = ""; s.content.promo.demoBadgeText = ""; s.content.promo.image = drop(s.content.promo.image); }
  }
  return out;
}

export function stripDemoFromSettings(s: SiteSettings): SiteSettings {
  const out = clone(s);
  out.demoContact = clone(emptyContact);
  return out;
}

/** What the footer/contact UI should actually show: real values win; demo values only when demo is visible. */
export function effectiveContact(s: SiteSettings, showDemo: boolean) {
  const d = showDemo ? s.demoContact : emptyContact;
  return {
    phone: s.phone || d.phone,
    contactEmail: s.contactEmail || d.contactEmail,
    website: s.website || d.website,
    social: {
      facebook: s.social.facebook || d.social.facebook, x: s.social.x || d.social.x, linkedin: s.social.linkedin || d.social.linkedin,
      instagram: s.social.instagram || d.social.instagram, youtube: s.social.youtube || d.social.youtube,
    },
  };
}

export const visibleLogos = <L extends { isDemo?: boolean }>(logos: L[], showDemo: boolean) => logos.filter((l) => showDemo || !l.isDemo);
