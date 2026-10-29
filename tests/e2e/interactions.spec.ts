import { expect, test } from "@playwright/test";
import { revealAll, trackErrors } from "./helpers";

test("scroll-triggered reveal: below-the-fold content fades in when scrolled to", async ({ page }) => {
  await page.goto("/");
  const faq = page.locator('[data-section="faq"] .container-abx > div').first();
  const opacity = () => faq.evaluate((e) => parseFloat(getComputedStyle(e).opacity));
  expect(await opacity()).toBeLessThan(0.5);                       // hidden before it is reached
  await faq.scrollIntoViewIfNeeded(); await page.waitForTimeout(1200);
  expect(await opacity()).toBe(1);                                  // revealed afterwards
});

test("prefers-reduced-motion: content is visible immediately, nothing is hidden for animation", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage(); await page.goto("/");
  const hidden = await page.$$eval("[data-section] .container-abx > div", (els) => els.filter((e) => parseFloat(getComputedStyle(e).opacity) < 1).length);
  expect(hidden).toBe(0);
  await ctx.close();
});

test("staggered service cards reveal one after another", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-section="services-grid"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const early = await page.$$eval('[data-section="services-grid"] a', (els) => els.map((e) => parseFloat(getComputedStyle(e.parentElement!).opacity)));
  await page.waitForTimeout(1600);
  const late = await page.$$eval('[data-section="services-grid"] a', (els) => els.map((e) => parseFloat(getComputedStyle(e.parentElement!).opacity)));
  expect(late.every((o) => o === 1)).toBe(true);
  expect(new Set(early.map((o) => o.toFixed(2))).size).toBeGreaterThan(1);   // mid-animation: cards are at different stages
});

test("sticky header stays at the top while scrolling and gains the blurred background", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 1200)); await page.waitForTimeout(500);
  const h = page.locator("header");
  expect((await h.boundingBox())!.y).toBe(0);
  expect(await h.getAttribute("data-scrolled")).toBe("true");
});

test("hover: service card lifts and gains a stronger shadow", async ({ page }) => {
  await page.goto("/"); await revealAll(page);
  const card = page.locator('[data-section="services-grid"] a').nth(1);
  await card.scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
  const before = await card.evaluate((e) => ({ top: e.getBoundingClientRect().top, shadow: getComputedStyle(e).boxShadow }));
  await card.hover(); await page.waitForTimeout(500);
  const after = await card.evaluate((e) => ({ top: e.getBoundingClientRect().top, shadow: getComputedStyle(e).boxShadow }));
  expect(before.top - after.top).toBeGreaterThanOrEqual(4);
  expect(after.shadow).not.toBe(before.shadow);
});

test("hover: portfolio image zooms and the 'View Project' overlay appears", async ({ page }) => {
  await page.goto("/"); await revealAll(page);
  const card = page.locator('[data-section="portfolio-gallery"] a:has(h3)').first();
  await card.scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
  const img = card.locator("img");
  const scale = () => img.evaluate((e) => { const m = new DOMMatrix(getComputedStyle(e).transform); return m.a; });
  const overlay = () => card.locator("span", { hasText: "View Project" }).evaluate((e) => parseFloat(getComputedStyle(e).opacity));
  expect(await scale()).toBe(1); expect(await overlay()).toBe(0);
  await card.hover(); await page.waitForTimeout(800);
  expect(await scale()).toBeGreaterThan(1.05); expect(await overlay()).toBeGreaterThan(0.9);
});

test("hover: buttons lift; navigation underline animates in", async ({ page }) => {
  await page.goto("/");
  const btn = page.locator('[data-section="hero"] a', { hasText: "Contact Us" });
  const y0 = (await btn.boundingBox())!.y; await btn.hover(); await page.waitForTimeout(400);
  expect(y0 - (await btn.boundingBox())!.y).toBeGreaterThan(0.5);
  const link = page.locator('header nav[aria-label="Main"] a', { hasText: "Services" });
  const line = link.locator("span[aria-hidden]");
  const sx = () => line.evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).a);
  expect(await sx()).toBe(0); await link.hover(); await page.waitForTimeout(500); expect(await sx()).toBe(1);
  const active = page.locator('header nav[aria-label="Main"] a[aria-current="page"] span[aria-hidden]');
  expect(await active.evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).a)).toBe(1);   // active page indicator
});

test("mobile menu opens, lists the links, and closes with Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 }); await page.goto("/");
  await page.getByRole("button", { name: /open menu/i }).click();
  const menu = page.locator("#mobile-menu"); await expect(menu).toBeVisible();
  for (const l of ["Home", "About Us", "Services", "Portfolio", "Contact"]) await expect(menu.getByRole("link", { name: l, exact: true })).toBeVisible();
  await page.keyboard.press("Escape"); await expect(menu).toBeHidden();
});

test("FAQ accordion: opens and closes with proper aria state", async ({ page }) => {
  await page.goto("/"); await revealAll(page);
  const q = page.getByRole("button", { name: /what services does abx cyber tech offer/i });
  await q.scrollIntoViewIfNeeded();
  await expect(q).toHaveAttribute("aria-expanded", "false");
  await q.click(); await expect(q).toHaveAttribute("aria-expanded", "true");
  const panel = page.locator(`#${await q.getAttribute("aria-controls")}`);
  await page.waitForTimeout(500); expect((await panel.boundingBox())!.height).toBeGreaterThan(10);
  await q.click(); await expect(q).toHaveAttribute("aria-expanded", "false");
});

test("testimonial indicators are working controls", async ({ page }) => {
  await page.goto("/"); await revealAll(page);
  const dots = page.getByRole("group", { name: /choose a testimonial/i }).getByRole("button");
  await expect(dots).toHaveCount(3);
  await expect(dots.nth(0)).toHaveAttribute("aria-current", "true");
  await dots.nth(2).click(); await expect(dots.nth(2)).toHaveAttribute("aria-current", "true"); await expect(dots.nth(0)).toHaveAttribute("aria-current", "false");
});

test("REGRESSION: shrinking the window to ~1px (what screenshot tools do) must not crash the page", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/"); await revealAll(page);
  await page.setViewportSize({ width: 1, height: 600 }); await page.waitForTimeout(500);
  await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(800);
  expect(errors).toEqual([]);
  expect(await page.locator("[data-section]").count()).toBe(8);
  await expect(page.getByText("We can't load this page right now")).toHaveCount(0);
});

test("keyboard: skip link is first focusable and focus is visible", async ({ page }) => {
  await page.goto("/"); await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: /skip to main content/i })).toBeFocused();
  await page.keyboard.press("Tab"); await page.keyboard.press("Tab");
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
  expect(outline).not.toBe("none");
});
