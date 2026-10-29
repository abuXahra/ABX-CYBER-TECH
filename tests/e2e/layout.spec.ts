import { expect, test } from "@playwright/test";
import { revealAll, trackErrors } from "./helpers";

const px = (v: string) => Math.round(parseFloat(v));

test.describe("spacing refinement (desktop 1440px)", () => {
  test("section padding follows the spacing guidelines, with sensible variation by section type", async ({ page }) => {
    const errors = trackErrors(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/"); await revealAll(page);
    const pad = (name: string) => page.locator(`[data-section="${name}"]`).evaluate((e) => { const c = getComputedStyle(e); return [parseFloat(c.paddingTop), parseFloat(c.paddingBottom)]; });
    const inRange = (v: number, lo: number, hi: number, what: string) => { expect(v, `${what} (${v}px) >= ${lo}`).toBeGreaterThanOrEqual(lo); expect(v, `${what} (${v}px) <= ${hi}`).toBeLessThanOrEqual(hi); };
    // standard content sections: py-20…py-28 (80–112px) on at least one side, never cramped on the other
    for (const [name, side] of [["services-grid", 0], ["about-split", 1], ["testimonials", 0], ["faq", 0], ["faq", 1]] as const) { const p = await pad(name); inRange(p[side]!, 80, 112, `${name} padding[${side}]`); }
    for (const name of ["services-grid", "about-split", "portfolio-gallery", "testimonials", "faq"]) { const p = await pad(name); expect(Math.min(...p), `${name} min padding`).toBeGreaterThanOrEqual(60); }
    const cta = await pad("call-to-action"); inRange(cta[0]!, 60, 80, "CTA padding-top"); inRange(cta[1]!, 60, 80, "CTA padding-bottom");   // 60–80px banner
    const strip = await pad("credibility-band"); inRange(strip[0]!, 36, 64, "credibility strip padding");                                      // distinct but not oversized
    expect(cta[0]!).toBeLessThan((await pad("services-grid"))[0]!);                                                                        // varies by section type
    expect(strip[0]!).toBeLessThan(cta[0]!);
    expect(errors).toEqual([]);
  });

  test("cards: 20–24px gaps, 24–28px padding, equal heights per row", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 }); await page.goto("/"); await revealAll(page);
    const m = await page.evaluate(() => {
      const rect = (e: Element) => e.getBoundingClientRect(), top = (e: Element) => Math.round(rect(e).top + scrollY);
      const row = (sel: string) => { const els = [...document.querySelectorAll(sel)]; return els.filter((e) => Math.abs(top(e) - top(els[0]!)) < 3); };
      const gap = (r: Element[]) => Math.round(rect(r[1]!).left - rect(r[0]!).right);
      const hs = (r: Element[]) => [...new Set(r.map((e) => Math.round(rect(e).height)))];
      const svc = row('[data-section="services-grid"] a:has(h3)'), tst = row('[data-section="testimonials"] figure'), prt = row('[data-section="portfolio-gallery"] a:has(h3)');
      const cs = getComputedStyle(svc[0]!);
      return { svc: [svc.length, gap(svc), hs(svc)], tst: [tst.length, gap(tst), hs(tst)], prt: [prt.length, gap(prt), hs(prt)], pad: [parseFloat(cs.paddingTop), parseFloat(cs.paddingLeft)] };
    });
    expect(m.svc[0]).toBe(5); expect(m.tst[0]).toBe(3); expect(m.prt[0]).toBe(3);
    for (const g of [m.svc[1], m.tst[1], m.prt[1]] as number[]) { expect(g).toBeGreaterThanOrEqual(20); expect(g).toBeLessThanOrEqual(24); }
    expect(m.pad[0]).toBeGreaterThanOrEqual(24); expect(m.pad[0]).toBeLessThanOrEqual(28);
    for (const h of [m.svc[2], m.tst[2], m.prt[2]] as number[][]) expect(h, "equal card heights").toHaveLength(1);
  });

  test("hero has breathing room and the devices stay large and uncropped", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 }); await page.goto("/");
    const m = await page.evaluate(() => {
      const hero = document.querySelector('[data-section="hero"]')!, r = (e: Element) => e.getBoundingClientRect();
      const eyebrow = hero.querySelector("p")!, h1 = hero.querySelector("h1")!, p = hero.querySelector("h1 ~ p")!, btns = hero.querySelector("h1 ~ div")!, badges = hero.querySelector("ul")!;
      const img = [...hero.querySelectorAll("img")].find((i) => r(i).width > 0)!;
      return { navGap: r(eyebrow).top - r(document.querySelector("header")!).bottom, a: r(p).top - r(h1).bottom, b: r(btns).top - r(p).bottom, c: r(badges).top - r(btns).bottom,
        imgW: r(img).width, imgAspect: r(img).width / r(img).height, natAspect: (img as HTMLImageElement).naturalWidth / (img as HTMLImageElement).naturalHeight,
        bottomGap: r(hero).bottom - r(img).bottom, topGap: r(img).top - r(hero).top, vw: innerWidth, textBottom: r(badges).bottom, heroH: r(hero).height };
    });
    expect(m.navGap).toBeGreaterThanOrEqual(56);                 // clear space under the navbar
    expect(m.a).toBeGreaterThanOrEqual(22); expect(m.b).toBeGreaterThanOrEqual(30); expect(m.c).toBeGreaterThanOrEqual(40);
    expect(m.imgW / m.vw).toBeGreaterThan(0.55);                 // devices remain large
    expect(Math.abs(m.imgAspect - m.natAspect)).toBeLessThan(0.02);   // and uncropped (rendered aspect = file aspect)
    expect(m.topGap).toBeGreaterThanOrEqual(40); expect(m.bottomGap).toBeGreaterThanOrEqual(40);   // space around the mockup
  });

  test("footer is roomy: padding, link rhythm and the copyright line", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 }); await page.goto("/"); await revealAll(page);
    const m = await page.evaluate(() => {
      const f = document.querySelector("footer")!, c = f.querySelector(".container-abx")!, cs = getComputedStyle(c);
      const links = [...f.querySelectorAll('nav[aria-label="Quick links"] a')].map((a) => a.getBoundingClientRect());
      return { pt: parseFloat(cs.paddingTop), pb: parseFloat(cs.paddingBottom), pitch: links[1]!.top - links[0]!.top };
    });
    expect(m.pt).toBeGreaterThanOrEqual(56); expect(m.pb).toBeGreaterThanOrEqual(40); expect(m.pitch).toBeGreaterThanOrEqual(24);
  });
});

  test("sections appear in the approved order", async ({ page }) => {
    await page.goto("/");
    const order = await page.$$eval("[data-section]", (els) => els.map((e) => (e as HTMLElement).dataset.section));
    expect(order).toEqual(["hero", "credibility-band", "services-grid", "about-split", "portfolio-gallery", "testimonials", "call-to-action", "faq"]);
  });

  test("hero is two columns with the device composition on the right edge", async ({ page }) => {
    await page.goto("/");
    const m = await page.evaluate(() => {
      const hero = document.querySelector('[data-section="hero"]')!; const h1 = hero.querySelector("h1")!.getBoundingClientRect();
      const img = [...hero.querySelectorAll("img")].find((i) => i.getBoundingClientRect().width > 0)!.getBoundingClientRect();
      return { imgLeft: img.left, imgRight: img.right, imgTop: img.top - hero.getBoundingClientRect().top, imgW: img.width, h1Top: h1.top, vw: innerWidth };
    });
    expect(m.imgTop).toBeLessThan(120);                // side-by-side with the text (not stacked below it)
    expect(m.imgTop).toBeGreaterThanOrEqual(40);       // …but with clear space between the navbar and the mockup
    expect(m.imgRight).toBeGreaterThan(m.vw - 5);      // bleeds to the right edge at 1440
    expect(m.imgW / m.vw).toBeGreaterThan(0.55);       // ≈ 59% of the width, like the reference
    expect(m.imgW / m.vw).toBeLessThan(0.64);
  });

  test("header uses the approved logo image and the amber Contact Us button", async ({ page }) => {
    await page.goto("/");
    const logo = page.locator("header a[aria-label$='home'] img").first();
    await expect(logo).toBeVisible();
    expect(await logo.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThanOrEqual(250);   // optimised variant of the 788px approved lockup
    const btn = page.locator("header a", { hasText: "Contact Us" }).first();
    expect(await btn.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe("rgb(252, 170, 43)");
  });

  test("five service cards in one row; three portfolio cards; three testimonials", async ({ page }) => {
    await page.goto("/"); await revealAll(page);
    const tops = async (sel: string) => (await page.$$eval(sel, (els) => els.map((e) => Math.round(e.getBoundingClientRect().top + scrollY))));
    const s = await tops('[data-section="services-grid"] a'); expect(s).toHaveLength(5); expect(new Set(s).size).toBe(1);
    const p = await tops('[data-section="portfolio-gallery"] a:has(h3)'); expect(p).toHaveLength(3); expect(new Set(p).size).toBe(1);
    const t = await tops('[data-section="testimonials"] figure'); expect(t).toHaveLength(3); expect(new Set(t).size).toBe(1);
  });

for (const [w, label] of [[1920, "1920"], [1440, "1440"], [1280, "1280"], [1024, "1024 (tablet)"], [900, "900"], [768, "768 (tablet)"], [390, "390 (mobile)"], [375, "375 (mobile)"]] as const) {
  test(`no horizontal overflow and no runtime errors at ${label}px`, async ({ page }) => {
    const errors = trackErrors(page);
    await page.setViewportSize({ width: w, height: w < 600 ? 800 : 900 });
    await page.goto("/"); await revealAll(page);
    const { docW, winW } = await page.evaluate(() => ({ docW: document.documentElement.scrollWidth, winW: innerWidth }));
    expect(docW).toBeLessThanOrEqual(winW);
    expect(errors).toEqual([]);
  });
}

test("responsive arrangement: columns reflow and navigation adapts", async ({ page }) => {
  const cols = async () => page.$$eval('[data-section="services-grid"] a', (els) => new Set(els.map((e) => Math.round(e.getBoundingClientRect().left))).size);
  await page.setViewportSize({ width: 1280, height: 900 }); await page.goto("/");
  expect(await cols()).toBe(5);
  await expect(page.locator('header nav[aria-label="Main"]')).toBeVisible();
  await page.setViewportSize({ width: 768, height: 900 }); expect(await cols()).toBe(3);
  await expect(page.locator('header nav[aria-label="Main"]')).toBeHidden();
  await page.setViewportSize({ width: 390, height: 800 }); expect(await cols()).toBe(1);
  await expect(page.getByRole("button", { name: /open menu/i })).toBeVisible();
});
