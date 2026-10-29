import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SectionRenderer } from "@/components/cms/section-renderer";
import { sectionComponents } from "@/components/cms/section-components";
import type { SectionContext } from "@/components/cms/context";
import { SiteFooter } from "@/components/website/site-footer";
import { FaqAccordion } from "@/components/website/sections/faq-accordion";
import { splitServiceName } from "@/components/website/sections/services";
import { DEFAULT_HOME, DEFAULT_NAVIGATION, DEFAULT_SETTINGS } from "@/lib/cms/defaults";
import { pageContentSchema, type PageContent } from "@/lib/cms/sections";
import { addBrandToSettings, addDemoToHome, addDemoToSettings } from "@/lib/demo/content";
import { DEMO_PROJECTS, DEMO_TESTIMONIALS } from "@/lib/demo/data";
import { SEED_FAQS, SEED_SERVICES } from "../scripts/seed-data";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

const IDS = { heroDevices: "m1", aboutWorkspace: "m2", faqContact: "m3", logoHeader: "m4", logoFooter: "m5" };
const media = (id: string, url: string, isDemo = true) => [id, { id, url, width: 600, height: 400, alt: "", focal: { x: 0.5, y: 0.5 }, isDemo }] as const;
const MEDIA = Object.fromEntries([media("m1", "/demo/hero-devices.jpg"), media("m2", "/demo/about-workspace.jpg"), media("m3", "/demo/faq-contact.jpg"), media("m4", "/demo/logo-header.png", false)]);

const ctx = (over: Partial<SectionContext> = {}): SectionContext => ({
  settings: addDemoToSettings(DEFAULT_SETTINGS, IDS), showDemo: false, media: {}, projects: [], testimonials: [],
  services: SEED_SERVICES.map((s, i) => ({ id: String(i), name: s.name, slug: s.slug, shortDescription: s.shortDescription, icon: s.icon })),
  faqs: SEED_FAQS.map((f, i) => ({ id: String(i), question: f.question, answer: f.answer })),
  ...over,
});
const demoCtx = () => ctx({
  showDemo: true, media: MEDIA,
  projects: DEMO_PROJECTS.map((p, i) => ({ id: String(i), title: p.title, slug: p.slug, category: p.category, thumbnailMediaId: null })),
  testimonials: DEMO_TESTIMONIALS.map((t, i) => ({ id: String(i), authorName: t.authorName, authorRole: t.authorRole, company: t.company, quote: t.quote, avatarMediaId: null })),
});
/** next/image rewrites sources to /_next/image?url=<encoded>, so match either form. */
const has = (html: string, p: string) => html.includes(p) || html.includes(encodeURIComponent(p)) || html.includes(encodeURIComponent(p).replace(/%2F$/, ""));
const render = (c: SectionContext, home: PageContent = addDemoToHome(DEFAULT_HOME, IDS)) => renderToStaticMarkup(<SectionRenderer sections={home.sections} ctx={c} />);

describe("every homepage section renders through the registry", () => {
  it("has a renderer for every enabled section type", () => {
    for (const s of DEFAULT_HOME.sections.filter((s) => s.enabled)) expect(sectionComponents[s.type], s.type).toBeTypeOf("function");
  });
  it("renders all 8 sections, in the approved order, when demo content is visible", () => {
    const html = render(demoCtx());
    const order = ["hero", "credibility-band", "services-grid", "about-split", "portfolio-gallery", "testimonials", "call-to-action", "faq"].map((s) => html.indexOf(`data-section="${s}"`));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
  it("respects hidden sections and CMS order", () => {
    const home = structuredClone(DEFAULT_HOME);
    home.sections.find((s) => s.id === "faq")!.enabled = false;
    home.sections.forEach((s) => (s.order += 1)); home.sections.find((s) => s.id === "cta")!.order = 0;
    const html = render(ctx(), home);
    expect(html).not.toContain('data-section="faq"');
    expect(html.indexOf('data-section="call-to-action"')).toBeLessThan(html.indexOf('data-section="hero"'));
  });
});

describe("hero follows the approved design", () => {
  const html = render(demoCtx());
  it("breaks the headline into three lines with only 'Digital Presence.' highlighted", () => {
    const h1 = html.match(/<h1[^>]*>(.*?)<\/h1>/s)![1]!;
    expect(h1.match(/<span class="block">/g)).toHaveLength(3);
    expect(h1).toContain("Build. Launch."); expect(h1).toContain("Grow Your");
    expect(h1).toMatch(/<span class="text-accent">Digital Presence\.<\/span>/);
  });
  it("uses the media-library composition image, with the approved copy", () => {
    expect(has(html, "/demo/hero-devices.jpg")).toBe(true);
    expect(html).toContain("We build websites, mobile apps, e-commerce solutions and custom digital products that help businesses grow, operate smarter and reach more customers.");
    for (const b of ["Abuja, FCT, Nigeria", "CAC Registered", "Est. 2020"]) expect(html).toContain(b);
  });
  it("renders replaceable device frames when laptop/phone screenshots are supplied", () => {
    const home = addDemoToHome(DEFAULT_HOME, IDS); const hero = home.sections[0]!;
    if (hero.type === "hero") hero.content.laptopScreen = { mediaId: "m1", alt: "Laptop screenshot", decorative: false };
    const out = render(demoCtx(), home);
    expect(out).toContain("Laptop screenshot"); expect(out).toContain("aspect-[16/10]");
  });
  it("falls back to built-in artwork when there is no image (e.g. demo imagery hidden)", () => {
    expect(render(ctx(), DEFAULT_HOME)).toContain("Illustration of a laptop and a smartphone");
  });
});

describe("services, about and contact content", () => {
  const html = render(demoCtx());
  it("shows exactly the five approved services; titles break after the first word", () => {
    for (const n of ["Website Development", "Website Design", "Website Redesign", "App Development"]) expect(html).toContain(n.split(" ")[0]);
    expect(html).toContain("E-commerce &amp;"); expect(html).not.toMatch(/Digital Marketing|Graphics Design|UI\/UX/);
    expect(splitServiceName("Website Development")).toEqual(["Website", "Development"]);
    expect(splitServiceName("E-commerce & Web Apps")).toEqual(["E-commerce &", "Web Apps"]);
    expect(splitServiceName("Hosting")).toEqual(["Hosting"]);
  });
  it("About matches the approved wording and the photo is the replaceable media image", () => {
    for (const x of ["We&#x27;re More Than Just an IT Company", "Expert Team", "Custom Solutions", "On-Time Delivery", "Reliable Support", "Learn More About Us", "Turning Ideas Into Digital Solutions"]) expect(html).toContain(x);
    expect(has(html, "/demo/about-workspace.jpg")).toBe(true);
  });
  it("uses Contact Us only — never a quote CTA", () => { expect(html).toContain("Contact Us"); expect(html).not.toMatch(/get a (free )?quote/i); });
});

describe("demo content is never shown as verified business information", () => {
  const demoText = ["TechStart", "KoyaMart", "Ahmed Musa", "Fatima Bello", "Business Website", "Trusted IT Partner", "Trusted by businesses, startups"];
  it("is visible in the demo preview", () => {
    const html = render(demoCtx());
    for (const s of demoText.filter((s) => s !== "Trusted IT Partner")) expect(html).toContain(s);
  });
  it("is completely absent from the public (production) render", () => {
    const html = render(ctx());     // showDemo: false, no demo records
    for (const s of demoText) expect(html, s).not.toContain(s);
    expect(has(html, "/demo/")).toBe(false);
    expect(html).not.toContain('data-section="portfolio-gallery"'); expect(html).not.toContain('data-section="testimonials"');
  });
  it("production credibility strip falls back to verified facts", () => {
    const html = render(ctx());
    expect(html).toContain("CAC registered"); expect(html).toContain("Registration Number 3435573");
  });
  it("footer shows contact rows and socials only for real values, or demo values in preview", () => {
    const s = addDemoToSettings(DEFAULT_SETTINGS, IDS);
    const prod = renderToStaticMarkup(<SiteFooter settings={s} navigation={DEFAULT_NAVIGATION.footer} services={[]} showDemo={false} />);
    expect(prod).not.toMatch(/tel:|mailto:|aria-label="Facebook"|\+234|abxcybertech\.com/); expect(prod).toContain("Reg. No: 3435573");
    const preview = renderToStaticMarkup(<SiteFooter settings={s} navigation={DEFAULT_NAVIGATION.footer} services={[]} showDemo />);
    for (const x of ["+234 803 133 4567", "info@abxcybertech.com", "www.abxcybertech.com"]) expect(preview).toContain(x);
    for (const n of ["Facebook", "X", "Instagram", "LinkedIn", "YouTube"]) expect(preview).toContain(`aria-label="${n}"`);
    const real = renderToStaticMarkup(<SiteFooter settings={{ ...s, phone: "+234 700 000 0000" }} navigation={DEFAULT_NAVIGATION.footer} services={[]} showDemo={false} />);
    expect(real).toContain("tel:+2347000000000");      // real values always show, regardless of demo mode
  });
  it("the logo is a genuine brand asset: shown in production when set", () => {
    const f = renderToStaticMarkup(<SiteFooter settings={addBrandToSettings(DEFAULT_SETTINGS, IDS)} navigation={DEFAULT_NAVIGATION.footer} services={[]} logo={MEDIA.m4 as never} />);
    expect(has(f, "/demo/logo-header.png")).toBe(true);
  });
});

describe("approved navigation / copy", () => {
  it("header shows Home, About Us, Services, Portfolio, Contact (Blog exists but is off)", () => {
    expect(DEFAULT_NAVIGATION.header.links.filter((l) => l.enabled).map((l) => l.label)).toEqual(["Home", "About Us", "Services", "Portfolio", "Contact"]);
  });
  it("FAQ uses the approved questions", () => {
    const html = render(ctx());
    for (const q of ["What services does ABX CYBER TECH offer?", "How long does it take to complete a project?", "Do you work with businesses outside Abuja?", "Can you help redesign my existing website?", "How do I get started?"]) expect(html).toContain(q);
    expect(html).toContain("Let&#x27;s Bring Your"); expect(html).toContain("Ideas to Life");
  });
});

describe("backward compatibility with already-published content", () => {
  it("revisions published before this redesign still validate and gain safe defaults", () => {
    const old = JSON.parse(JSON.stringify(DEFAULT_HOME));
    for (const s of old.sections) {
      delete s.styles.background.gradientFrom; delete s.styles.background.gradientTo; delete s.styles.background.gradientAngle;
      if (s.type === "hero") { delete s.content.caption; delete s.content.laptopScreen; delete s.content.phoneScreen; }
      if (s.type === "credibility-band") { delete s.content.logosHeading; s.content.logos.forEach((l: Record<string, unknown>) => delete l.isDemo); }
      if (s.type === "services-grid") delete s.content.titleBreak;
      if (s.type === "faq") { delete s.content.promo; s.variant = "accordion"; }
    }
    const r = pageContentSchema.safeParse(old);
    expect(r.success).toBe(true);
    if (r.success) { const f = r.data.sections.find((s) => s.type === "faq"); expect(f && f.type === "faq" && f.content.promo.enabled).toBe(false); }
  });
  it("malformed CMS data is rejected instead of rendered", () => {
    const bad = JSON.parse(JSON.stringify(DEFAULT_HOME)); bad.sections[0].order = "0";
    expect(pageContentSchema.safeParse(bad).success).toBe(false);
    const bad2 = JSON.parse(JSON.stringify(DEFAULT_HOME)); bad2.sections[0].content.primaryButton.href = "javascript:alert(1)";
    expect(pageContentSchema.safeParse(bad2).success).toBe(false);
  });
});

describe("FAQ accordion accessibility", () => {
  it("renders buttons wired to regions, closed by default", () => {
    const out = renderToStaticMarkup(<FaqAccordion items={[{ id: "a", question: "Q1?", answer: "A1" }]} allowMultiple={false} />);
    expect(out).toContain('aria-expanded="false"'); expect(out).toContain("aria-controls"); expect(out).toContain('role="region"'); expect(out).toContain("inert");
  });
});
