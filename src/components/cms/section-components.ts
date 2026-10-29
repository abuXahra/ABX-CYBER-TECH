import type { ReactNode } from "react";
import type { SectionOf, SectionType } from "@/lib/cms/sections";
import type { SectionContext } from "./context";
import { HeroSection } from "@/components/website/sections/hero";
import { CredibilitySection } from "@/components/website/sections/credibility";
import { ServicesSection } from "@/components/website/sections/services";
import { AboutSection } from "@/components/website/sections/about";
import { PortfolioSection } from "@/components/website/sections/portfolio";
import { TestimonialsSection } from "@/components/website/sections/testimonials";
import { CtaSection } from "@/components/website/sections/cta";
import { FaqSection } from "@/components/website/sections/faq";

export type SectionComponent<T extends SectionType> = (props: { section: SectionOf<T>; ctx: SectionContext }) => ReactNode;

/**
 * The public renderer registry: one component per section type. Types without a renderer yet
 * (rich-text, contact-panel — Phase 3) are skipped safely instead of crashing the page.
 */
export const sectionComponents: { [T in SectionType]?: SectionComponent<T> } = {
  hero: HeroSection,
  "credibility-band": CredibilitySection,
  "services-grid": ServicesSection,
  "about-split": AboutSection,
  "portfolio-gallery": PortfolioSection,
  testimonials: TestimonialsSection,
  "call-to-action": CtaSection,
  faq: FaqSection,
};
