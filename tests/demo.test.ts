import { describe, expect, it } from "vitest";
import { isDemoContentVisible, publicRecordFilter } from "@/lib/demo/visibility";
import { addDemoToHome, addDemoToSettings, effectiveContact, stripDemoFromHome, stripDemoFromSettings, visibleLogos } from "@/lib/demo/content";
import { DEFAULT_HOME, DEFAULT_SETTINGS } from "@/lib/cms/defaults";
import { DEMO_LOGOS, DEMO_MEDIA } from "@/lib/demo/data";
import { pageContentSchema } from "@/lib/cms/sections";
import { siteSettingsSchema } from "@/lib/cms/site";
import { Project } from "@/models/Project";
import { Testimonial } from "@/models/Testimonial";
import { DEFAULT_THEME, themeSchema, checkThemeAccessibility } from "@/lib/cms/theme";

describe("demo visibility switch", () => {
  it("is on in development, off in production, and overridable", () => {
    expect(isDemoContentVisible({ NODE_ENV: "development" })).toBe(true);
    expect(isDemoContentVisible({ NODE_ENV: "production" })).toBe(false);
    expect(isDemoContentVisible({ NODE_ENV: "production", SHOW_DEMO_CONTENT: "true" })).toBe(true);
    expect(isDemoContentVisible({ NODE_ENV: "development", SHOW_DEMO_CONTENT: "false" })).toBe(false);
    expect(isDemoContentVisible({ NODE_ENV: "production", SHOW_DEMO_CONTENT: "" })).toBe(false);
  });
  it("public queries only ever return genuine, published records unless demo is visible", () => {
    expect(publicRecordFilter(false)).toEqual({ isPublished: true, isDemo: { $ne: true } });
    expect(publicRecordFilter(true)).toEqual({ $or: [{ isPublished: true, isDemo: { $ne: true } }, { isDemo: true }] });
  });
});

describe("demo records cannot be published (enforced by the data model)", () => {
  const base = { title: "T", slug: "t", category: "C" };
  it("a demo project that is unpublished is valid", () => { expect(new Project({ ...base, isDemo: true, isPublished: false }).validateSync()).toBeUndefined(); });
  it("a demo project marked published is rejected", () => {
    expect(new Project({ ...base, isDemo: true, isPublished: true }).validateSync()?.message ?? "").toMatch(/Demo content cannot be published/);
  });
  it("a demo testimonial marked published is rejected; a genuine one is fine", () => {
    const t = { authorName: "A", quote: "Q" };
    expect(new Testimonial({ ...t, isDemo: true, isPublished: true }).validateSync()).toBeDefined();
    expect(new Testimonial({ ...t, isDemo: false, isPublished: true }).validateSync()).toBeUndefined();
  });
  it("new records default to genuine-and-unpublished (never silently public)", () => {
    const p = new Project(base); expect(p.isPublished).toBe(false); expect(p.isDemo).toBe(false);
  });
});

describe("demo content inside CMS documents", () => {
  const ids = { heroDevices: "h", aboutWorkspace: "a", faqContact: "f", logoHeader: "lh", logoFooter: "lf" };
  it("adds valid sample content, all logos flagged isDemo", () => {
    const home = addDemoToHome(DEFAULT_HOME, ids);
    expect(pageContentSchema.safeParse(home).success).toBe(true);
    const cred = home.sections.find((s) => s.type === "credibility-band")!;
    if (cred.type === "credibility-band") { expect(cred.content.logos).toHaveLength(DEMO_LOGOS.length); expect(cred.content.logos.every((l) => l.isDemo)).toBe(true); }
    expect(siteSettingsSchema.safeParse(addDemoToSettings(DEFAULT_SETTINGS, ids)).success).toBe(true);
  });
  it("sample imagery is flagged demo; the approved logos are genuine assets", () => {
    expect(DEMO_MEDIA.filter((m) => m.key.startsWith("logo")).every((m) => !m.isDemo)).toBe(true);
    expect(DEMO_MEDIA.filter((m) => !m.key.startsWith("logo")).every((m) => m.isDemo)).toBe(true);
  });
  it("stripping removes demo logos/contact/imagery refs but keeps real ones", () => {
    const home = addDemoToHome(DEFAULT_HOME, ids);
    const cred = home.sections.find((s) => s.type === "credibility-band")!;
    if (cred.type === "credibility-band") cred.content.logos.push({ name: "Real Client", icon: "building", image: { mediaId: null, alt: "", decorative: false }, isDemo: false });
    const out = stripDemoFromHome(home, new Set(["h", "a", "f"]));
    const c2 = out.sections.find((s) => s.type === "credibility-band")!;
    expect(c2.type === "credibility-band" && c2.content.logos.map((l) => l.name)).toEqual(["Real Client"]);
    const hero = out.sections[0]!; expect(hero.type === "hero" && hero.content.image.mediaId).toBeNull();
    const s = stripDemoFromSettings(addDemoToSettings(DEFAULT_SETTINGS, ids));
    expect(s.demoContact.phone).toBe(""); expect(s.logoMediaId).toBe("lh");   // genuine logo reference kept
  });
  it("stripping a fully-demo homepage returns the genuine default content", () => {
    const stripped = stripDemoFromHome(addDemoToHome(DEFAULT_HOME, ids), new Set(["h", "a", "f"]));
    const cred = stripped.sections.find((s) => s.type === "credibility-band")!;
    expect(cred.type === "credibility-band" && cred.content.logos).toEqual([]);
    expect(cred.variant).toBe("capabilities");
  });
  it("effective contact: real values win; demo values only in preview", () => {
    const s = addDemoToSettings({ ...DEFAULT_SETTINGS, phone: "+234 700 000 0000" }, ids);
    expect(effectiveContact(s, false).phone).toBe("+234 700 000 0000");
    expect(effectiveContact(s, false).contactEmail).toBe("");
    expect(effectiveContact(s, true).contactEmail).toBe("info@abxcybertech.com");
    expect(effectiveContact(s, true).phone).toBe("+234 700 000 0000");
  });
  it("visibleLogos hides demo logos outside the preview", () => {
    const logos = [{ isDemo: true }, { isDemo: false }];
    expect(visibleLogos(logos, false)).toHaveLength(1); expect(visibleLogos(logos, true)).toHaveLength(2);
  });
});

describe("theme tokens", () => {
  it("the reference-sampled default theme passes every mandatory contrast check", () => {
    expect(checkThemeAccessibility(DEFAULT_THEME).errors).toEqual([]);
  });
  it("themes published before the cyan/tint tokens existed still validate with defaults", () => {
    const old = JSON.parse(JSON.stringify(DEFAULT_THEME)); delete old.colors.cyan; delete old.colors.tint;
    const r = themeSchema.safeParse(old); expect(r.success).toBe(true);
    if (r.success) { expect(r.data.colors.cyan).toBe("#41DCE9"); expect(r.data.colors.tint).toBe("#BDF0F2"); }
  });
});
