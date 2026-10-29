import { describe, expect, it } from "vitest";
import { isSafeHref } from "@/lib/cms/links";
import { checkThemeAccessibility, contrastRatio, DEFAULT_THEME, themeSchema, themeToCss } from "@/lib/cms/theme";
import { pageContentSchema, type PageContent } from "@/lib/cms/sections";
import { SECTION_REGISTRY, SECTION_TYPES } from "@/lib/cms/registry";
import { DEFAULT_HOME, DEFAULT_NAVIGATION, DEFAULT_SETTINGS } from "@/lib/cms/defaults";
import { navigationSchema, siteSettingsSchema } from "@/lib/cms/site";

describe("safe links", () => {
  it.each(["/", "/about", "/services/website-design", "https://example.com/x", "mailto:a@b.co", "tel:+2348000000000"])(
    "accepts %s", (v) => expect(isSafeHref(v)).toBe(true));
  it.each(["javascript:alert(1)", "//evil.com", "data:text/html,x", " /about", "http://insecure.com", "JaVaScRiPt:alert(1)", ""])(
    "rejects %j", (v) => expect(isSafeHref(v)).toBe(false));
});

describe("theme", () => {
  it("default theme is valid and passes all mandatory contrast checks", () => {
    expect(themeSchema.safeParse(DEFAULT_THEME).success).toBe(true);
    expect(checkThemeAccessibility(DEFAULT_THEME).errors).toEqual([]);
  });
  it("white on amber fails AA, which is why the CTA uses dark teal text", () => {
    expect(contrastRatio("#FFFFFF", "#FCAA2B")).toBeLessThan(4.5);
    expect(contrastRatio("#0B2530", "#FCAA2B")).toBeGreaterThanOrEqual(4.5);
  });
  it("blocks low-contrast themes", () => {
    const bad = structuredClone(DEFAULT_THEME);
    bad.colors.accentButtonText = "#FFFFFF";
    bad.colors.focusRing = "#FFFFFF";
    const { errors } = checkThemeAccessibility(bad);
    expect(errors.map((e) => e.pair)).toEqual(expect.arrayContaining(["Accent button text", "Focus ring on background"]));
  });
  it("rejects non-HEX colours and unknown fonts (no CSS injection)", () => {
    const evil = structuredClone(DEFAULT_THEME) as any;
    evil.colors.primary = "red; } body{display:none";
    expect(themeSchema.safeParse(evil).success).toBe(false);
    const font = structuredClone(DEFAULT_THEME) as any;
    font.typography.headingFont = "https://evil.com/font.woff";
    expect(themeSchema.safeParse(font).success).toBe(false);
  });
  it("emits CSS custom properties from the theme", () => {
    const css = themeToCss(DEFAULT_THEME);
    expect(css).toContain("--color-primary: #00595c;");
    expect(css).toContain("--color-accent-rgb: 252 170 43;");
    expect(css).not.toMatch(/[<>]/);
  });
});

describe("CMS content", () => {
  it("default home page, navigation and settings are schema-valid", () => {
    expect(pageContentSchema.safeParse(DEFAULT_HOME).success).toBe(true);
    expect(navigationSchema.safeParse(DEFAULT_NAVIGATION).success).toBe(true);
    expect(siteSettingsSchema.safeParse(DEFAULT_SETTINGS).success).toBe(true);
  });
  it("registers all ten supported section types", () => {
    expect(SECTION_TYPES.sort()).toEqual(
      ["about-split","call-to-action","contact-panel","credibility-band","faq","hero","portfolio-gallery","rich-text","services-grid","testimonials"]);
    for (const t of SECTION_TYPES) expect(SECTION_REGISTRY[t].variants.length).toBeGreaterThan(0);
  });
  it("rejects duplicate section ids, unknown types and unsafe button links", () => {
    const dup: PageContent = structuredClone(DEFAULT_HOME);
    dup.sections[1]!.id = dup.sections[0]!.id;
    expect(pageContentSchema.safeParse(dup).success).toBe(false);

    const unknown = structuredClone(DEFAULT_HOME) as any;
    unknown.sections[0].type = "custom-html";
    expect(pageContentSchema.safeParse(unknown).success).toBe(false);

    const unsafe = structuredClone(DEFAULT_HOME) as any;
    unsafe.sections[0].content.primaryButton.href = "javascript:alert(1)";
    expect(pageContentSchema.safeParse(unsafe).success).toBe(false);
  });
  it("requires alt text for non-decorative images", () => {
    const p = structuredClone(DEFAULT_HOME) as any;
    p.sections[0].content.image = { mediaId: "abc", alt: "", decorative: false };
    expect(pageContentSchema.safeParse(p).success).toBe(false);
  });
  it("contains no Get a Quote wording and only the five approved services' scope", () => {
    expect(JSON.stringify([DEFAULT_HOME, DEFAULT_NAVIGATION])).not.toMatch(/quote/i);
  });
});
