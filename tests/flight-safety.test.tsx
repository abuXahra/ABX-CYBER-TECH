import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Reveal } from "@/components/animations/reveal";
import { StaggerGroup, StaggerItem } from "@/components/animations/stagger";
import { Float } from "@/components/animations/float";
import { ANIMATION_PRESETS, pageContentSchema, sectionAnimationSchema } from "@/lib/cms/sections";
import { DEFAULT_HOME, DEFAULT_NAVIGATION, DEFAULT_SETTINGS } from "@/lib/cms/defaults";
import { DEFAULT_THEME } from "@/lib/cms/theme";
import { SEED_FAQS, SEED_SERVICES } from "../scripts/seed-data";

/**
 * Everything that crosses the Server→Client Component boundary is serialised by React's Flight protocol.
 * These guards make sure CMS data is plain JSON (no Date / ObjectId / undefined / class instances).
 */
describe("server → client boundary data is plain JSON", () => {
  const plain = (v: unknown) => JSON.parse(JSON.stringify(v));
  it.each([
    ["home page content", DEFAULT_HOME], ["navigation", DEFAULT_NAVIGATION], ["settings", DEFAULT_SETTINGS], ["theme", DEFAULT_THEME],
  ])("%s survives a JSON round-trip unchanged", (_n, v) => expect(plain(v)).toEqual(v));

  it("validated page content contains no undefined values", () => {
    const parsed = pageContentSchema.parse(plain(DEFAULT_HOME));
    expect(Object.keys(parsed).length).toBeGreaterThan(0);
    expect(JSON.stringify(parsed)).toBe(JSON.stringify(plain(parsed)));
  });
  it("a document with MongoDB-style values is rejected, not rendered", () => {
    const bad = plain(DEFAULT_HOME);
    bad.sections[0].order = "0"; // string where a number is required
    expect(pageContentSchema.safeParse(bad).success).toBe(false);
    const bad2 = plain(DEFAULT_HOME);
    bad2.sections[0].animation = { preset: "bounce", durationMs: 600, delayMs: 0, once: true };
    expect(pageContentSchema.safeParse(bad2).success).toBe(false);
  });
  it("seeded collection views are plain strings/numbers", () => {
    for (const s of SEED_SERVICES) expect(typeof s.slug + typeof s.icon).toBe("stringstring");
    for (const f of SEED_FAQS) expect(plain(f)).toEqual(f);
  });
});

describe("animation integration conforms to the Motion API surface we use", () => {
  const anim = (preset: (typeof ANIMATION_PRESETS)[number]) => sectionAnimationSchema.parse({ preset, durationMs: 600, delayMs: 100, once: true });
  it.each([...ANIMATION_PRESETS])("Reveal renders for preset %s", (preset) => {
    expect(() => renderToStaticMarkup(<Reveal animation={anim(preset)}><p>x</p></Reveal>)).not.toThrow();
  });
  it.each([...ANIMATION_PRESETS])("StaggerGroup/Item render for preset %s", (preset) => {
    expect(() => renderToStaticMarkup(<StaggerGroup animation={anim(preset)}><StaggerItem><p>x</p></StaggerItem></StaggerGroup>)).not.toThrow();
  });
  it("Float renders enabled and disabled", () => {
    expect(() => renderToStaticMarkup(<Float><p>x</p></Float>)).not.toThrow();
    expect(() => renderToStaticMarkup(<Float enabled={false}><p>x</p></Float>)).not.toThrow();
  });
  it("every non-'none' preset has a defined offset in Reveal (no undefined access)", () => {
    for (const p of ANIMATION_PRESETS.filter((x) => x !== "none")) {
      expect(renderToStaticMarkup(<Reveal animation={anim(p)}><i /></Reveal>)).toContain("opacity:0");
    }
  });
});
