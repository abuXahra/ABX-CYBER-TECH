import type { PageContent, PageSection } from "./sections";
import type { Navigation, SiteSettings } from "./site";

/**
 * Seed + safe-fallback content. Only approved company facts appear here.
 * Contact details are intentionally empty until the company supplies verified values.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  companyName: "ABX CYBER TECH",
  tagline: "INNOVATION · TECHNOLOGY · SOLUTIONS",
  description:
    "ABX CYBER TECH is an Abuja-based information technology company dedicated to delivering innovative, reliable, and client-focused digital solutions.",
  mission:
    "To bring Information and Communication Technology (ICT) closer to the people by developing innovative, accessible, and customized software solutions tailored to the needs of clients.",
  vision: "",
  cacNumber: "3435573",
  establishedYear: 2020,
  location: "Abuja, Federal Capital Territory, Nigeria",
  contactEmail: "",
  phone: "",
  whatsapp: "",
  website: "",
  address: "",
  social: { facebook: "", x: "", linkedin: "", instagram: "", youtube: "" },
  demoContact: { phone: "", contactEmail: "", website: "", social: { facebook: "", x: "", linkedin: "", instagram: "", youtube: "" } },
  logoMediaId: null,
  footerLogoMediaId: null,
  faviconMediaId: null,
  footer: {
    description: "Building innovative digital solutions for businesses and organizations in Abuja and beyond.",
    copyrightHolder: "ABX CYBER TECH",
  },
  seoDefaults: {
    titleTemplate: "%s | ABX CYBER TECH",
    description:
      "Website development, website design, redesign, app development and e-commerce solutions from Abuja, Nigeria.",
    ogImageId: null,
  },
};

export const DEFAULT_NAVIGATION: Navigation = {
  header: {
    links: [
      { id: "home", label: "Home", href: "/", enabled: true },
      { id: "about", label: "About Us", href: "/about", enabled: true },
      { id: "services", label: "Services", href: "/services", enabled: true },
      { id: "portfolio", label: "Portfolio", href: "/portfolio", enabled: true },
      { id: "blog", label: "Blog", href: "/blog", enabled: false }, // hidden to match the approved mockup; enable in the CMS
      { id: "contact", label: "Contact", href: "/contact", enabled: true },
    ],
    cta: { label: "Contact Us", href: "/contact", enabled: true },
  },
  footer: {
    quickLinks: [
      { id: "home", label: "Home", href: "/", enabled: true },
      { id: "about", label: "About Us", href: "/about", enabled: true },
      { id: "services", label: "Services", href: "/services", enabled: true },
      { id: "portfolio", label: "Portfolio", href: "/portfolio", enabled: true },
      { id: "contact", label: "Contact", href: "/contact", enabled: true },
    ],
    legalLinks: [
      { id: "privacy", label: "Privacy Policy", href: "/privacy", enabled: false }, // not shown in the approved mockup; enable in the CMS
      { id: "terms", label: "Terms of Service", href: "/terms", enabled: false },
    ],
  },
};

const noImage = { mediaId: null, alt: "", decorative: false };
const styles: PageSection["styles"] = {
  background: { mode: "none", color: null, imageMediaId: null, overlayOpacity: 0, gradientFrom: null, gradientTo: null, gradientAngle: 90 },
  textColor: null,
  paddingY: "inherit",
  width: "contained",
};
const anim = (preset: PageSection["animation"]["preset"]): PageSection["animation"] => ({
  preset, durationMs: 600, delayMs: 0, once: true,
});
const btn = (label: string, href: string, variant: "primary" | "accent" | "outline") => ({
  label, href, variant, newTab: false, enabled: true,
});

export const DEFAULT_HOME: PageContent = {
  seo: {
    title: "Build. Launch. Grow Your Digital Presence.",
    description:
      "ABX CYBER TECH is an Abuja-based IT company building websites, mobile apps and e-commerce solutions for businesses that want to grow.",
    ogImageId: null,
    noindex: false,
  },
  sections: [
    {
      id: "hero", type: "hero", enabled: true, order: 0, variant: "split-image", styles, animation: anim("fade-in"),
      content: {
        eyebrow: "Welcome to ABX CYBER TECH",
        headline: "Build. Launch.\nGrow Your\nDigital Presence.",
        headlineHighlight: "Digital Presence.",
        description:
          "We build websites, mobile apps, e-commerce solutions and custom digital products that help businesses grow, operate smarter and reach more customers.",
        primaryButton: btn("Contact Us", "/contact", "accent"),
        secondaryButton: btn("Explore Services", "/services", "outline"),
        image: noImage, mobileImage: noImage, laptopScreen: noImage, phoneScreen: noImage,
        badges: [
          { icon: "map-pin", text: "Abuja, FCT, Nigeria" },
          { icon: "shield-check", text: "CAC Registered" },
          { icon: "calendar", text: "Est. 2020" },
        ],
        floatingMotion: true,
        caption: "Websites, Mobile Apps & Digital Solutions",
      },
    },
    {
      // Verified facts only (PRD §2). No client logos or figures are shown because none were supplied.
      id: "credibility", type: "credibility-band", enabled: true, order: 1, variant: "capabilities", styles, animation: anim("fade-in"),
      content: {
        heading: "Registered in Nigeria · Based in Abuja", logosHeading: "",
        items: [
          { title: "CAC registered", description: "Registration Number 3435573" },
          { title: "Established 2020", description: "Registered with the Corporate Affairs Commission" },
          { title: "Based in Abuja", description: "Federal Capital Territory, Nigeria" },
          { title: "Five core services", description: "Websites, design, redesign, apps and e-commerce" },
        ],
        logos: [],
      },
    },
    {
      id: "services", type: "services-grid", enabled: true, order: 2, variant: "cards", styles, animation: anim("stagger"),
      content: {
        eyebrow: "Our services",
        heading: "Technology Solutions for Modern Businesses",
        description: "We design, develop, and deliver digital products tailored to your business needs.",
        source: "published-services", limit: 5, titleBreak: true,
      },
    },
    {
      id: "about", type: "about-split", enabled: true, order: 3, variant: "image-left", styles, animation: anim("slide-right"),
      content: {
        eyebrow: "About ABX CYBER TECH",
        heading: "We're More Than Just an IT Company",
        body:
          "ABX CYBER TECH is an Abuja-based information technology company dedicated to delivering innovative, reliable, and client-focused digital solutions. Registered with the Corporate Affairs Commission (CAC) in 2020 under Registration Number 3435573, we help businesses, organizations, and individuals leverage technology to achieve their goals.",
        mission: "", // the mockup shows no mission line here; the mission lives in Site Settings and the About page
        registrationNote: "",
        image: noImage, imageCaption: "Turning Ideas Into Digital Solutions",
        highlights: [
          { icon: "users", title: "Expert Team", description: "Skilled and experienced professionals" },
          { icon: "settings", title: "Custom Solutions", description: "Built around your unique needs" },
          { icon: "clock", title: "On-Time Delivery", description: "We value your time and goals" },
          { icon: "life-buoy", title: "Reliable Support", description: "We're with you, always" },
        ],
        button: btn("Learn More About Us", "/about", "primary"),
      },
    },
    {
      id: "portfolio", type: "portfolio-gallery", enabled: true, order: 4, variant: "split-intro", styles, animation: anim("slide-up"),
      content: {
        eyebrow: "Our portfolio",
        heading: "Our Recent Projects",
        description: "We've helped businesses and organizations build their online presence and achieve their goals with innovative digital solutions.",
        button: btn("View All Projects", "/portfolio", "primary"),
        limit: 3, hideWhenEmpty: true,
      },
    },
    {
      id: "testimonials", type: "testimonials", enabled: true, order: 5, variant: "carousel", styles, animation: anim("fade-in"),
      content: {
        eyebrow: "What our clients say",
        heading: "Trusted by Businesses, Loved by Clients",
        autoplay: false, intervalMs: 6000,
      },
    },
    {
      id: "cta", type: "call-to-action", enabled: true, order: 6, variant: "band",
      styles: { ...styles, background: { mode: "gradient", color: "#01545A", imageMediaId: null, overlayOpacity: 0, gradientFrom: "#00393F", gradientTo: "#01595C", gradientAngle: 90 }, textColor: "#FFFFFF" },
      animation: anim("slide-up"),
      content: {
        eyebrow: "Ready to start your next project?",
        heading: "Let's Build Something Great Together",
        description: "Get in touch with us today and let's turn your ideas into reality.",
        primaryButton: btn("Contact Us", "/contact", "accent"),
        secondaryButton: btn("Explore Services", "/services", "outline"),
      },
    },
    {
      id: "faq", type: "faq", enabled: true, order: 7, variant: "split-promo", styles, animation: anim("fade-in"),
      content: {
        eyebrow: "FAQ", heading: "Frequently Asked Questions", source: "published-faqs", allowMultipleOpen: false,
        promo: {
          enabled: true, eyebrow: "Have a project in mind?", heading: "Let's Bring Your\nIdeas to Life",
          description: "From websites to mobile apps and e-commerce platforms, we're here to help you build, launch and grow with technology.",
          button: btn("Contact Us", "/contact", "primary"), image: noImage,
          badgeTitle: "CAC Registered", badgeText: "Abuja, Nigeria", demoBadgeTitle: "", demoBadgeText: "",
        },
      },
    },
  ],
};

export const PAGE_SLUGS = ["home", "about", "services", "portfolio", "blog", "contact", "privacy", "terms"] as const;
export type PageSlug = (typeof PAGE_SLUGS)[number];

/** Empty-but-valid shell for pages whose real content is seeded in Phase 3. */
export function defaultPageContent(slug: string): PageContent {
  if (slug === "home") return DEFAULT_HOME;
  return { seo: { title: "", description: "", ogImageId: null, noindex: false }, sections: [] };
}
