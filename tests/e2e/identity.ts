import type { Page } from "@playwright/test";

/** Computed typography / colour / size metrics of key elements. The snapshot in tests/reference/identity-snapshot.json
 *  was captured from the approved design before the spacing refinement. */
export async function collectIdentity(page: Page): Promise<Record<string, Record<string, string | number> | null>> {
  return page.evaluate(() => {
  const S = (sel: string, props: string[], root: ParentNode = document) => { const e = root.querySelector(sel); if (!e) return null; const cs = getComputedStyle(e) as unknown as Record<string, string>, r = e.getBoundingClientRect(); const o: Record<string, string | number> = {}; for (const p of props) o[p] = p === "w" ? Math.round(r.width) : p === "h" ? Math.round(r.height) : cs[p]!; return o; };
  const T = ["fontSize", "fontWeight", "fontFamily", "color", "lineHeight", "letterSpacing"];
  const B = ["backgroundColor", "borderRadius", "borderTopColor", "borderTopWidth", "color", "fontSize", "fontWeight", "w", "h"];
  const sec = (n: string) => document.querySelector(`[data-section="${n}"]`);
  const q = (n: string, sel: string, props: string[]) => S(sel, props, sec(n)!);
  return {
    "header link": S('header nav a', T), "header cta": S("header a[href='/contact']", B), "header logo": S("header a[aria-label$='home'] img", ["w"]),
    "hero eyebrow": q("hero", "p", T), "hero h1": q("hero", "h1", T), "hero p": q("hero", "p:nth-of-type(2)", T), "hero primary btn": q("hero", "a", B),
    "hero image": q("hero", "img", ["w", "h"]),
    "cred heading": q("credibility-band", "h2", T), "cred logo text": q("credibility-band", "li span", T),
    "services eyebrow": q("services-grid", "p", T), "services h2": q("services-grid", "h2", T), "services desc": q("services-grid", "h2 + p", T),
    "service card": q("services-grid", "a", B), "service h3": q("services-grid", "h3", T), "service p": q("services-grid", "a p", T), "service icon": q("services-grid", "a svg", ["w", "h", "color"]),
    "about image": q("about-split", "img", ["w", "h", "borderRadius"]), "about h2": q("about-split", "h2", T), "about p": q("about-split", "h2 + p", T),
    "about highlight icon": q("about-split", "ul li span", ["w", "h", "backgroundColor", "borderRadius"]), "about highlight title": q("about-split", "ul li p", T), "about button": q("about-split", "a", B),
    "portfolio h2": q("portfolio-gallery", "h2", T), "portfolio card": q("portfolio-gallery", "a:has(h3)", ["w", "borderRadius", "backgroundColor"]), "portfolio card image": q("portfolio-gallery", "a:has(h3) img", ["w", "h"]),
    "portfolio h3": q("portfolio-gallery", "h3", T), "portfolio category": q("portfolio-gallery", "h3 + p", T), "portfolio button": q("portfolio-gallery", "a:not(:has(h3))", B),
    "testimonials h2": q("testimonials", "h2", T), "testimonial card": q("testimonials", "figure", ["w", "borderRadius", "borderTopColor", "backgroundColor"]), "testimonial quote": q("testimonials", "blockquote", T),
    "testimonial name": q("testimonials", "figcaption span span", T), "testimonial avatar": q("testimonials", "figcaption img", ["w", "h"]),
    "cta h2": q("call-to-action", "h2", T), "cta eyebrow": q("call-to-action", "p", T), "cta bg": S('[data-section="call-to-action"]', ["backgroundImage"]), "cta primary": q("call-to-action", "a", B),
    "faq h2": q("faq", "h2", T), "faq row": q("faq", "button", ["fontSize", "fontWeight", "color", "borderRadius"]), "faq promo": q("faq", "aside", ["backgroundColor", "borderRadius"]), "faq promo h2": q("faq", "aside h2", T),
    "footer": S("footer", ["backgroundColor", "color"]), "footer heading": S("footer h2", T), "footer link": S("footer nav a", T), "footer logo": S("footer img", ["w"]),
  };
  });
}
