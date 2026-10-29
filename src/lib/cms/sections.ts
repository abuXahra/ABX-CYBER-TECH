import { z } from "zod";
import { hex, } from "./theme";
import { safeHref } from "./links";

const text = (max: number) => z.string().trim().max(max);

export const ICON_NAMES = [
  "globe", "palette", "refresh-cw", "smartphone", "shopping-cart", "map-pin", "shield-check",
  "calendar", "users", "settings", "clock", "life-buoy", "code", "layout", "rocket", "mail",
  "phone", "message-circle", "tag", "badge-check", "headset",
  "shield", "leaf", "heart-pulse", "building", "truck",
] as const;
export const iconName = z.enum(ICON_NAMES);

/** Images are referenced by media-library ID, never by arbitrary URL. */
export const imageRef = z
  .object({
    mediaId: z.string().trim().max(64).nullable(),
    alt: text(200),
    decorative: z.boolean().default(false),
  })
  .superRefine((v, ctx) => {
    if (v.mediaId && !v.decorative && v.alt.length === 0) {
      ctx.addIssue({ code: "custom", path: ["alt"], message: "Alt text is required for non-decorative images" });
    }
  });

export const buttonSchema = z.object({
  label: text(60).min(1),
  href: safeHref,
  variant: z.enum(["primary", "accent", "outline"]),
  newTab: z.boolean(),
  enabled: z.boolean(),
});

/* ---------- shared style + animation schemas ---------- */

export const ANIMATION_PRESETS = ["none", "fade-in", "slide-up", "slide-left", "slide-right", "stagger"] as const;

export const sectionAnimationSchema = z.object({
  preset: z.enum(ANIMATION_PRESETS),
  durationMs: z.number().int().min(100).max(1500),
  delayMs: z.number().int().min(0).max(1000),
  once: z.boolean(),
});

export const sectionStylesSchema = z.object({
  background: z.object({
    mode: z.enum(["none", "color", "gradient", "image"]),
    color: hex.nullable(),
    imageMediaId: z.string().trim().max(64).nullable(),
    overlayOpacity: z.number().min(0).max(1),
    gradientFrom: hex.nullable().default(null),
    gradientTo: hex.nullable().default(null),
    gradientAngle: z.number().int().min(0).max(360).default(90),
  }),
  textColor: hex.nullable(),
  paddingY: z.enum(["inherit", "none", "sm", "md", "lg", "xl"]),
  width: z.enum(["contained", "wide", "full"]),
});

/* ---------- section content schemas ---------- */

const eyebrow = text(80);
const heading = text(160);
const para = text(1200);

const heroContent = z.object({
  eyebrow,
  headline: heading.min(1),
  headlineHighlight: text(120),
  description: para,
  primaryButton: buttonSchema,
  secondaryButton: buttonSchema,
  /** Complete device composition (default). Replace it from the media library. */
  image: imageRef,
  mobileImage: imageRef,
  /** Optional: supply a laptop and/or phone screenshot to render CSS device frames instead of the composition. */
  laptopScreen: imageRef.default({ mediaId: null, alt: "", decorative: false }),
  phoneScreen: imageRef.default({ mediaId: null, alt: "", decorative: false }),
  badges: z.array(z.object({ icon: iconName, text: text(60).min(1) })).max(5),
  floatingMotion: z.boolean(),
  /** Handwritten-style caption beside the hero artwork. Optional so older published content still validates. */
  caption: text(80).default(""),
});

const credibilityContent = z.object({
  heading,
  /** Heading shown above real logos (e.g. "Trusted by …"). Only used when at least one visible logo exists. */
  logosHeading: text(160).default(""),
  items: z.array(z.object({ title: text(80).min(1), description: text(200) })).max(6),
  /** Logos flagged isDemo are sample entries: shown only in the demo preview, never on the public site. */
  logos: z.array(z.object({ name: text(80).min(1), image: imageRef, icon: iconName.nullable().default(null), isDemo: z.boolean().default(false) })).max(12),
});

const servicesContent = z.object({
  eyebrow,
  heading: heading.min(1),
  description: para,
  source: z.literal("published-services"),
  limit: z.number().int().min(1).max(12),
  /** Break card titles after the first word, as in the approved design. */
  titleBreak: z.boolean().default(true),
});

const aboutContent = z.object({
  eyebrow,
  heading: heading.min(1),
  body: para,
  mission: para,
  registrationNote: text(300),
  image: imageRef,
  imageCaption: text(80),
  highlights: z.array(z.object({ icon: iconName, title: text(60).min(1), description: text(160) })).max(6),
  button: buttonSchema,
});

const portfolioContent = z.object({
  eyebrow,
  heading: heading.min(1),
  description: para,
  button: buttonSchema,
  limit: z.number().int().min(3).max(6),
  hideWhenEmpty: z.boolean(),
});

const testimonialsContent = z.object({
  eyebrow,
  heading: heading.min(1),
  autoplay: z.boolean(),
  intervalMs: z.number().int().min(3000).max(15000),
});

const ctaContent = z.object({
  eyebrow,
  heading: heading.min(1),
  description: para,
  primaryButton: buttonSchema,
  secondaryButton: buttonSchema,
});

const promoSchema = z.object({
  enabled: z.boolean(),
  eyebrow,
  heading,
  description: para,
  button: buttonSchema,
  image: imageRef,
  badgeTitle: text(40),
  badgeText: text(40),
  /** Optional sample badge, shown only in the demo preview in place of the verified one. */
  demoBadgeTitle: text(40).default(""),
  demoBadgeText: text(40).default(""),
});
const PROMO_OFF = {
  enabled: false, eyebrow: "", heading: "", description: "",
  button: { label: "Contact Us", href: "/contact", variant: "primary" as const, newTab: false, enabled: true },
  image: { mediaId: null, alt: "", decorative: false }, badgeTitle: "", badgeText: "", demoBadgeTitle: "", demoBadgeText: "",
};

const faqContent = z.object({
  eyebrow,
  heading: heading.min(1),
  source: z.literal("published-faqs"),
  allowMultipleOpen: z.boolean(),
  /** Optional side card used by the "split-promo" variant. Defaults to off so older content still validates. */
  promo: promoSchema.default(PROMO_OFF),
});

const richTextContent = z.object({
  heading: heading,
  /** Sanitised server-side (allow-listed tags only) before it is ever stored. */
  html: z.string().max(50_000),
});

const contactPanelContent = z.object({
  heading: heading.min(1),
  description: para,
  showForm: z.boolean(),
  showDetails: z.boolean(),
});

function makeSection<T extends string, V extends readonly [string, ...string[]], C extends z.ZodTypeAny>(
  type: T,
  variants: V,
  content: C,
) {
  return z.object({
    id: z.string().trim().min(1).max(64),
    type: z.literal(type),
    enabled: z.boolean(),
    order: z.number().int().min(0),
    variant: z.enum(variants),
    content,
    styles: sectionStylesSchema,
    animation: sectionAnimationSchema,
  });
}

export const heroSection = makeSection("hero", ["split-image", "centered"] as const, heroContent);
export const credibilitySection = makeSection("credibility-band", ["capabilities", "logos"] as const, credibilityContent);
export const servicesSection = makeSection("services-grid", ["cards", "compact"] as const, servicesContent);
export const aboutSection = makeSection("about-split", ["image-left", "image-right"] as const, aboutContent);
export const portfolioSection = makeSection("portfolio-gallery", ["grid", "split-intro"] as const, portfolioContent);
export const testimonialsSection = makeSection("testimonials", ["carousel", "cards"] as const, testimonialsContent);
export const ctaSection = makeSection("call-to-action", ["band", "card"] as const, ctaContent);
export const faqSection = makeSection("faq", ["accordion", "split-promo"] as const, faqContent);
export const richTextSection = makeSection("rich-text", ["standard", "narrow"] as const, richTextContent);
export const contactPanelSection = makeSection("contact-panel", ["split", "stacked"] as const, contactPanelContent);

export const sectionSchema = z.discriminatedUnion("type", [
  heroSection, credibilitySection, servicesSection, aboutSection, portfolioSection,
  testimonialsSection, ctaSection, faqSection, richTextSection, contactPanelSection,
]);

export type PageSection = z.infer<typeof sectionSchema>;
export type SectionType = PageSection["type"];
export type SectionOf<T extends SectionType> = Extract<PageSection, { type: T }>;

export const seoSchema = z.object({
  title: text(70),
  description: text(160),
  ogImageId: z.string().trim().max(64).nullable(),
  noindex: z.boolean(),
});

export const pageContentSchema = z
  .object({ seo: seoSchema, sections: z.array(sectionSchema).max(40) })
  .superRefine((page, ctx) => {
    const seen = new Set<string>();
    page.sections.forEach((s, i) => {
      if (seen.has(s.id)) {
        ctx.addIssue({ code: "custom", path: ["sections", i, "id"], message: `Duplicate section id "${s.id}"` });
      }
      seen.add(s.id);
    });
  });

export type PageContent = z.infer<typeof pageContentSchema>;
