/**
 * SAMPLE content that reproduces the approved design for development preview.
 * Everything here is flagged isDemo, stored in MongoDB, editable/replaceable/removable — never genuine business data.
 * Pure data: importable by scripts and tests.
 */
export const DEMO_MEDIA = [
  // Approved company logo lockups — genuine brand assets (isDemo: false)
  { key: "logoHeader", publicId: "demo/logo-header", file: "logo-header.png", width: 788, height: 104, alt: "ABX CYBER TECH logo", isDemo: false },
  { key: "logoFooter", publicId: "demo/logo-footer", file: "logo-footer.png", width: 788, height: 100, alt: "ABX CYBER TECH logo", isDemo: false },
  // Sample imagery — replace from the media library
  { key: "heroDevices", publicId: "demo/hero-devices", file: "hero-devices.jpg", width: 1122, height: 636, alt: "Laptop and smartphone showing a modern website and mobile app", isDemo: true },
  { key: "aboutWorkspace", publicId: "demo/about-workspace", file: "about-workspace.jpg", width: 672, height: 432, alt: "Developer workspace with a laptop showing code and an ABX mug", isDemo: true },
  { key: "faqContact", publicId: "demo/faq-contact", file: "faq-contact.jpg", width: 602, height: 392, alt: "Developer working on a laptop", isDemo: true },
  { key: "projectWebsite", publicId: "demo/project-website", file: "project-website.jpg", width: 298, height: 138, alt: "Sample business website project", isDemo: true },
  { key: "projectMobile", publicId: "demo/project-mobile", file: "project-mobile.jpg", width: 278, height: 138, alt: "Sample mobile app project", isDemo: true },
  { key: "projectEcommerce", publicId: "demo/project-ecommerce", file: "project-ecommerce.jpg", width: 314, height: 138, alt: "Sample e-commerce platform project", isDemo: true },
  { key: "avatar1", publicId: "demo/avatar-1", file: "avatar-1.jpg", width: 105, height: 105, alt: "", isDemo: true },
  { key: "avatar2", publicId: "demo/avatar-2", file: "avatar-2.jpg", width: 105, height: 105, alt: "", isDemo: true },
  { key: "avatar3", publicId: "demo/avatar-3", file: "avatar-3.jpg", width: 105, height: 105, alt: "", isDemo: true },
] as const;
export type DemoMediaKey = (typeof DEMO_MEDIA)[number]["key"];

export const DEMO_LOGOS = [
  { name: "TechStart", icon: "shield-check" }, { name: "KoyaMart", icon: "leaf" }, { name: "HealthPlus", icon: "heart-pulse" },
  { name: "EduBridge", icon: "building" }, { name: "LogiTrack", icon: "truck" }, { name: "FinanceHub", icon: "shield" },
] as const;
export const DEMO_LOGOS_HEADING = "Trusted by businesses, startups and organizations across Nigeria";
export const DEMO_BADGE = { demoBadgeTitle: "Trusted IT Partner", demoBadgeText: "Abuja, Nigeria" } as const;

export const DEMO_CONTACT = {
  phone: "+234 803 133 4567", contactEmail: "info@abxcybertech.com", website: "https://www.abxcybertech.com",
  social: { facebook: "https://www.facebook.com/", x: "https://x.com/", linkedin: "https://www.linkedin.com/", instagram: "https://www.instagram.com/", youtube: "https://www.youtube.com/" },
} as const;

export const DEMO_PROJECTS = [
  { title: "Business Website", slug: "demo-business-website", category: "Website Development", media: "projectWebsite", order: 0 },
  { title: "Mobile App", slug: "demo-mobile-app", category: "App Development", media: "projectMobile", order: 1 },
  { title: "E-commerce Platform", slug: "demo-ecommerce-platform", category: "Web Application", media: "projectEcommerce", order: 2 },
] as const;

export const DEMO_TESTIMONIALS = [
  { authorName: "Ahmed Musa", authorRole: "CEO", company: "Musa Ventures", avatar: "avatar1", order: 0,
    quote: "ABX CYBER TECH delivered an amazing website for our business. The team was professional, responsive and easy to work with." },
  { authorName: "Fatima Bello", authorRole: "Founder", company: "Bello Retail", avatar: "avatar2", order: 1,
    quote: "Their app development skills are top-notch. They understood our needs and delivered exactly what we wanted." },
  { authorName: "Ibrahim Lawal", authorRole: "MD", company: "Lawal Group", avatar: "avatar3", order: 2,
    quote: "Professional, creative and reliable. They helped us redesign our website and our online presence has never been better." },
] as const;
