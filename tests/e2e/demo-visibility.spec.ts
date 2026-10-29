import { expect, test } from "@playwright/test";

/**
 * Run twice:  EXPECT_DEMO=true  against a server with SHOW_DEMO_CONTENT=true (or `npm run dev`)
 *             EXPECT_DEMO=false against a production-style server (SHOW_DEMO_CONTENT=false) — demo content must be absent.
 */
const demo = process.env.EXPECT_DEMO;
const DEMO_STRINGS = ["TechStart", "KoyaMart", "HealthPlus", "EduBridge", "LogiTrack", "FinanceHub", "Ahmed Musa", "Fatima Bello", "Ibrahim Lawal", "+234 803 133 4567", "info@abxcybertech.com", "www.abxcybertech.com", "Business Website", "Trusted by businesses, startups"];

test.skip(demo === undefined, "set EXPECT_DEMO=true|false");

test("demo content visibility follows the environment", async ({ page }) => {
  await page.goto("/");
  const text = (await page.locator("body").innerText()).toLowerCase();   // CSS uppercases some headings
  const imgs = await page.$$eval("img", (els) => els.map((e) => e.getAttribute("src") ?? ""));
  if (demo === "true") {
    for (const s of DEMO_STRINGS) expect(text, s).toContain(s.toLowerCase());
    expect(imgs.some((s) => s.includes("hero-devices"))).toBe(true);
  } else {
    for (const s of DEMO_STRINGS) expect(text, `public site must not show demo text: ${s}`).not.toContain(s.toLowerCase());
    expect(imgs.some((s) => s.includes("/demo/") && !s.includes("logo"))).toBe(false);   // only the genuine logo asset is allowed
    expect(await page.locator('[data-section="portfolio-gallery"], [data-section="testimonials"]').count()).toBe(0);
    for (const s of ["CAC registered", "Reg. No: 3435573", "Abuja, FCT"]) expect(text).toContain(s.toLowerCase()); // verified facts stay
  }
});
