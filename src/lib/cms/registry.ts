import { z } from "zod";
import {
  aboutSection, contactPanelSection, credibilitySection, ctaSection, faqSection, heroSection,
  portfolioSection, richTextSection, servicesSection, testimonialsSection,
  sectionAnimationSchema, sectionStylesSchema, type SectionType,
} from "./sections";

export type SectionDefinition = {
  type: SectionType;
  label: string;
  description: string;
  variants: readonly string[];
  /** Full section schema (content + styles + animation). */
  schema: z.ZodTypeAny;
  contentSchema: z.ZodTypeAny;
  styleSchema: typeof sectionStylesSchema;
  animationSchema: typeof sectionAnimationSchema;
  /** When true, only one instance of this section may exist on a page. */
  singleton: boolean;
};

function define<S extends z.ZodObject<z.ZodRawShape>>(
  type: SectionType, label: string, description: string, schema: S, singleton = false,
): SectionDefinition {
  return {
    type, label, description, schema,
    contentSchema: schema.shape.content as z.ZodTypeAny,
    variants: (schema.shape.variant as z.ZodEnum<[string, ...string[]]>).options,
    styleSchema: sectionStylesSchema,
    animationSchema: sectionAnimationSchema,
    singleton,
  };
}

/** The typed registry of every section the CMS can render and the editor can edit. */
export const SECTION_REGISTRY: Record<SectionType, SectionDefinition> = {
  hero: define("hero", "Hero", "Opening banner with headline, buttons and imagery.", heroSection, true),
  "credibility-band": define("credibility-band", "Credibility band", "Verified capabilities or client logos.", credibilitySection),
  "services-grid": define("services-grid", "Services grid", "Cards loaded from published services.", servicesSection),
  "about-split": define("about-split", "About split layout", "Company introduction beside an image.", aboutSection),
  "portfolio-gallery": define("portfolio-gallery", "Portfolio gallery", "Published projects.", portfolioSection),
  testimonials: define("testimonials", "Testimonials", "Approved testimonials carousel.", testimonialsSection),
  "call-to-action": define("call-to-action", "Call to action", "Closing prompt with buttons.", ctaSection),
  faq: define("faq", "FAQ", "Accessible accordion from published FAQs.", faqSection),
  "rich-text": define("rich-text", "Rich text", "Sanitised formatted text.", richTextSection),
  "contact-panel": define("contact-panel", "Contact panel", "Contact details and form.", contactPanelSection),
};

export const SECTION_TYPES = Object.keys(SECTION_REGISTRY) as SectionType[];
