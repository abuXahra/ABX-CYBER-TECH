import { z } from "zod";
import { optionalSafeHref, safeHref } from "./links";
import { seoSchema } from "./sections";

const text = (max: number) => z.string().trim().max(max);
const optionalEmail = z.union([z.literal(""), z.string().trim().email().max(254)]);

const navLink = z.object({
  id: z.string().trim().min(1).max(64),
  label: text(40).min(1),
  href: safeHref,
  enabled: z.boolean(),
});

export const navigationSchema = z.object({
  header: z.object({
    links: z.array(navLink).max(10),
    cta: z.object({ label: text(40).min(1), href: safeHref, enabled: z.boolean() }),
  }),
  footer: z.object({
    quickLinks: z.array(navLink).max(10),
    legalLinks: z.array(navLink).max(6),
  }),
});
export type Navigation = z.infer<typeof navigationSchema>;

export const siteSettingsSchema = z.object({
  companyName: text(80).min(1),
  tagline: text(120),
  description: text(600),
  mission: text(600),
  vision: text(600),
  /** Verified company facts. Leave contact fields empty until verified. */
  cacNumber: text(30),
  establishedYear: z.number().int().min(1900).max(2100),
  location: text(120),
  contactEmail: optionalEmail,
  phone: text(30),
  whatsapp: text(30),
  website: optionalSafeHref.default(""),
  address: text(200),
  social: z.object({
    facebook: optionalSafeHref,
    x: optionalSafeHref,
    linkedin: optionalSafeHref,
    instagram: optionalSafeHref,
    youtube: optionalSafeHref,
  }),
  /** Sample contact details shown only in the demo preview; real values go in the fields above. */
  demoContact: z
    .object({
      phone: text(30), contactEmail: optionalEmail, website: optionalSafeHref,
      social: z.object({ facebook: optionalSafeHref, x: optionalSafeHref, linkedin: optionalSafeHref, instagram: optionalSafeHref, youtube: optionalSafeHref }),
    })
    .default({ phone: "", contactEmail: "", website: "", social: { facebook: "", x: "", linkedin: "", instagram: "", youtube: "" } }),
  logoMediaId: z.string().trim().max(64).nullable(),
  footerLogoMediaId: z.string().trim().max(64).nullable().default(null),
  faviconMediaId: z.string().trim().max(64).nullable(),
  footer: z.object({ description: text(300), copyrightHolder: text(80) }),
  seoDefaults: z.object({
    titleTemplate: text(80),
    description: text(160),
    ogImageId: z.string().trim().max(64).nullable(),
  }),
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export { seoSchema };
