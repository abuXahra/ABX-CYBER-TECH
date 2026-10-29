import { expect, test } from "@playwright/test";
import { revealAll, trackErrors } from "./helpers";

/** Guideline ranges: tablet py-16…20 (64–80px), mobile py-12…16 (48–64px); gutters px-6 (tablet) / px-5 (mobile). */
const CASES = [
  { w: 768, label: "tablet 768", padTop: [64, 80], gutter: 24 },
  { w: 390, label: "mobile 390", padTop: [48, 64], gutter: 20 },
  { w: 375, label: "mobile 375", padTop: [48, 64], gutter: 20 },
] as const;

for (const c of CASES) {
  test(`${c.label}: comfortable (not excessive) spacing, correct gutters, no overflow`, async ({ page }) => {
    const errors = trackErrors(page);
    await page.setViewportSize({ width: c.w, height: 800 }); await page.goto("/"); await revealAll(page);
    const m = await page.evaluate(() => {
      const pad = (n: string) => parseFloat(getComputedStyle(document.querySelector(`[data-section="${n}"]`)!).paddingTop);
      const left = document.querySelector('[data-section="services-grid"] h2')!.getBoundingClientRect().left;
      const card = document.querySelector('[data-section="services-grid"] a:has(h3)') as HTMLElement;
      return { svc: pad("services-grid"), about: pad("about-split"), faq: pad("faq"), cta: pad("call-to-action"), cardLeft: card.getBoundingClientRect().left,
        docW: document.documentElement.scrollWidth, winW: innerWidth, cardPad: parseFloat(getComputedStyle(card).paddingLeft) };
    });
    for (const v of [m.svc, m.faq]) { expect(v).toBeGreaterThanOrEqual(c.padTop[0]); expect(v).toBeLessThanOrEqual(c.padTop[1]); }
    expect(m.cta).toBeLessThan(m.svc);                  // CTA stays tighter than content sections
    expect(Math.round(m.cardLeft)).toBe(c.gutter);
    expect(m.cardPad).toBeGreaterThanOrEqual(24); expect(m.docW).toBeLessThanOrEqual(m.winW);
    expect(errors).toEqual([]);
  });
}

test("the FAQ contact photo never overlaps the text on any width", async ({ page }) => {
  for (const w of [1440, 1280, 1024, 900, 768, 390]) {
    await page.setViewportSize({ width: w, height: 900 }); await page.goto("/"); await revealAll(page);
    const m = await page.evaluate(() => {
      const aside = document.querySelector('[data-section="faq"] aside')!;
      const photo = aside.querySelector("img")?.parentElement?.getBoundingClientRect(); const text = aside.querySelector("div.relative")!;
      const lines = [...text.querySelectorAll("p, h2, a")].map((e) => e.getBoundingClientRect());
      return { photoTop: photo?.top ?? 0, photoLeft: photo?.left ?? 0, textRightMax: Math.max(...lines.map((r) => r.right)), textBottomMax: Math.max(...lines.map((r) => r.bottom)), desktop: innerWidth >= 900 };
    });
    if (!m.desktop) expect(m.photoTop, `stacked below text @${w}`).toBeGreaterThanOrEqual(m.textBottomMax - 1);   // phones/tablets: photo is below the text
  }
});
