import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SectionRenderer } from "@/components/cms/section-renderer";
import type { SectionContext } from "@/components/cms/context";
import { DEFAULT_HOME, DEFAULT_SETTINGS } from "@/lib/cms/defaults";
import { DEFAULT_THEME, themeSchema, themeToCss, type Theme } from "@/lib/cms/theme";
import { SEED_FAQS, SEED_SERVICES } from "../scripts/seed-data";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

const rem = (css: string, re: RegExp) => parseFloat(css.match(re)![1]!) * 16;      // → px at a 16px root
const withSpacing = (section: Theme["spacing"]["section"], card: Theme["spacing"]["card"] = "comfortable"): Theme => ({ ...DEFAULT_THEME, spacing: { section, card } });

describe("spacing tokens generated from the theme", () => {
  const css = themeToCss(DEFAULT_THEME);
  it("default section rhythm sits inside the requested guideline ranges", () => {
    expect(rem(css, /--section-y: ([\d.]+)rem;/)).toBeGreaterThanOrEqual(80);                                        // desktop py-20…py-28 → 80–112px
    expect(rem(css, /--section-y: ([\d.]+)rem;/)).toBeLessThanOrEqual(112);
    const tablet = rem(css, /max-width:899px\)\{:root\{--section-y:([\d.]+)rem/);                                    // tablet py-16…py-20 → 64–80px
    expect(tablet).toBeGreaterThanOrEqual(64); expect(tablet).toBeLessThanOrEqual(80);
    const mobile = rem(css, /max-width:639px\)\{:root\{--section-y:([\d.]+)rem/);                                    // mobile py-12…py-16 → 48–64px
    expect(mobile).toBeGreaterThanOrEqual(48); expect(mobile).toBeLessThanOrEqual(64);
  });
  it("card gap is 20–24px and card padding 24–28px by default", () => {
    const gap = rem(css, /--card-gap: ([\d.]+)rem;/), pad = rem(css, /--card-pad: ([\d.]+)rem;/);
    expect(gap).toBeGreaterThanOrEqual(20); expect(gap).toBeLessThanOrEqual(24);
    expect(pad).toBeGreaterThanOrEqual(24); expect(pad).toBeLessThanOrEqual(28);
  });
  it("is fully theme-driven: compact / spacious and cozy / roomy change the tokens", () => {
    expect(themeToCss(withSpacing("compact"))).toContain("--section-y: 4.5rem;");
    expect(themeToCss(withSpacing("spacious"))).toContain("--section-y: 7rem;");
    const roomy = themeToCss(withSpacing("comfortable", "roomy")); expect(roomy).toContain("--card-pad: 2rem;"); expect(roomy).toContain("--card-gap: 1.75rem;");
    expect(themeToCss(withSpacing("comfortable", "cozy"))).toContain("--card-pad: 1.5rem;");
  });
  it("emits only safe CSS (no markup, no injection)", () => { expect(css).not.toMatch(/[<>]/); expect(css).toMatch(/^:root\{[^}]+\}@media/); });
  it("themes published before the card-spacing token existed still validate (default: comfortable)", () => {
    const old = JSON.parse(JSON.stringify(DEFAULT_THEME)); delete old.spacing.card;
    const r = themeSchema.safeParse(old); expect(r.success).toBe(true); if (r.success) expect(r.data.spacing.card).toBe("comfortable");
    expect(themeSchema.safeParse({ ...old, spacing: { section: "enormous" } }).success).toBe(false);
  });
});

describe("section padding is token-driven and CMS-editable", () => {
  const ctx = (): SectionContext => ({
    settings: DEFAULT_SETTINGS, showDemo: false, media: {}, projects: [], testimonials: [],
    services: SEED_SERVICES.map((s, i) => ({ id: String(i), name: s.name, slug: s.slug, shortDescription: s.shortDescription, icon: s.icon })),
    faqs: SEED_FAQS.map((f, i) => ({ id: String(i), question: f.question, answer: f.answer })),
  });
  const openTag = (html: string, type: string) => html.match(new RegExp(`<section[^>]*data-section="${type}"[^>]*>`))![0];

  it("every default section takes its padding from the spacing token (class 'sy'), with per-type multipliers", () => {
    const html = renderToStaticMarkup(<SectionRenderer sections={DEFAULT_HOME.sections} ctx={ctx()} />);
    for (const t of ["hero", "credibility-band", "services-grid", "about-split", "call-to-action", "faq"]) {
      const tag = openTag(html, t); expect(tag, t).toMatch(/class="[^"]*\bsy\b/); expect(tag, t).not.toMatch(/py-\[/);
    }
    expect(openTag(html, "credibility-band")).toContain("--sy-top:0.5");   // slim strip
    expect(openTag(html, "call-to-action")).toContain("--sy-top:0.8");     // banner: tighter than content sections
    expect(openTag(html, "services-grid")).toContain("--sy-top:1");        // standard sections: full rhythm
  });
  it("the Website Editor's padding setting overrides the default, scaled by the same token", () => {
    const render = (paddingY: "none" | "sm" | "md" | "lg" | "xl") => {
      const sections = structuredClone(DEFAULT_HOME.sections); sections.find((s) => s.id === "services")!.styles.paddingY = paddingY;
      return openTag(renderToStaticMarkup(<SectionRenderer sections={sections} ctx={ctx()} />), "services-grid");
    };
    expect(render("none")).toContain("py-0");
    expect(render("sm")).toContain("--sy-top:0.5"); expect(render("md")).toContain("--sy-top:0.75");
    expect(render("lg")).toContain("--sy-top:1]"); expect(render("xl")).toContain("--sy-top:1.35");
  });
});
