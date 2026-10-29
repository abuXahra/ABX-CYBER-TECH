import type { FaqView, MediaView, ProjectView, ServiceView, TestimonialView } from "@/lib/cms/collections";
import type { SiteSettings } from "@/lib/cms/site";

/** Everything a section renderer may need, loaded once per request by loadSectionContext(). */
export type SectionContext = {
  settings: SiteSettings;
  /** True only in the development/demo preview: sample content may be displayed. */
  showDemo: boolean;
  media: Record<string, MediaView>;
  services: ServiceView[];
  projects: ProjectView[];
  testimonials: TestimonialView[];
  faqs: FaqView[];
};
