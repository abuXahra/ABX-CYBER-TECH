import type { Page } from "@playwright/test";

/** Scroll the whole page so scroll-triggered reveals fire, then return to the top. */
export async function revealAll(page: Page) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 450) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(80); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
}

export async function sectionBoxes(page: Page) {
  return page.evaluate(() => {
    const r = (el: Element) => { const b = el.getBoundingClientRect(); return { top: Math.round(b.top + scrollY), h: Math.round(b.height), left: Math.round(b.left), w: Math.round(b.width) }; };
    const o: Record<string, { top: number; h: number; left: number; w: number }> = { header: r(document.querySelector("header")!), footer: r(document.querySelector("footer")!) };
    document.querySelectorAll<HTMLElement>("[data-section]").forEach((e) => { o[e.dataset.section!] = r(e); });
    return o;
  });
}

/** Console errors that matter. 404s from prefetching inner pages (built in Phase 3) are expected and ignored. */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push("console: " + m.text()); });
  return errors;
}
