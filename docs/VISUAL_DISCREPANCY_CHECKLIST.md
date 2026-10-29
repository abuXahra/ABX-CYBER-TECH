# Visual discrepancy checklist — approved design (Image 1) vs previous implementation (Image 2)

Method: Image 2 (1920 px full-page capture) compared with Image 1 (941×1672, a scaled 1440 px desktop design). The
corrected build was then measured in real headless Chromium 153 against Image 1 scaled to a 1440 px viewport.

| # | Discrepancy found in Image 2 | Root cause | Status |
|---|---|---|---|
| 1 | Hero text and devices stacked in ONE column; devices tiny | Layout classes were applied to the scroll-reveal wrapper's parent, so the grid had a single child (also broke the CTA and FAQ split) | Fixed in `SectionShell` |
| 2 | Small generic SVG instead of the premium device composition | No photographic asset | Real composition image extracted from Image 1 → media library (replaceable); CSS device frames for replacement screenshots |
| 3 | Headline wrapped "Build. Launch. / Grow Your Digital / Presence." in teal/orange at wrong size | Single string, wrong font size, theme colours | Editor-controlled line breaks, size matched (±2 %), amber `#FCAA2B`, dark heading `#0B2530` |
| 4 | Text-only logo | No logo asset | Approved lockup extracted (header + footer variants) → media library → Site Settings |
| 5 | Credibility strip: 4 text facts in a 2×2 block | Verified-facts layout only | Horizontal 6-logo strip (demo logos) with production fallback to verified facts |
| 6 | Service cards looked different (outline icons, full-width titles) | Icon style, title wrapping | Solid teal icons, title break after first word, 5 equal cards, same radius/shadow |
| 7 | About: flat illustration, mission box, no badge look | Placeholder art | Photo asset, dark-teal badge, 2×2 cyan icon grid, matching wording |
| 8 | **Portfolio missing** | Hidden when no published projects | Three demo projects (isDemo, unpublished) shown in demo preview |
| 9 | **Testimonials missing** | Same | Three demo testimonials with avatars, indicators |
| 10 | CTA band: buttons wrapped below the text; amber eyebrow | Issue #1; wrong colour | Horizontal layout, teal gradient, cyan eyebrow |
| 11 | FAQ: single centred column, "QUESTIONS" pill | Variant not used | Two-column FAQ + "Let's Bring Your Ideas to Life" card with photo |
| 12 | Footer: 1 contact row, legal links, different spacing | Settings empty, line-height bug | 4-column footer, social icons, contact rows (demo/real), tight spacing |
| 13 | Body font/wrapping differed | Inter vs design's geometric sans | Plus Jakarta Sans body |
| 14 | Nav showed Blog; text too large/spaced | Defaults | Blog switched off in CMS; nav sized to the design |
| 15 | Old content in the database (v1) | `design:apply` had not been run | `npm run design:apply` publishes the new design as a NEW revision |

Also found and fixed during real-browser testing (not visible in Image 2):
* **Crash:** testimonial carousel divided by `clientWidth`; during a ~1 px window resize (full-page screenshot tools) it produced `Infinity` → `Array.from` threw → whole page replaced by the error screen. Fixed + regression test + per-section error boundary.
* Scroll-reveal content was server-rendered hidden for reduced-motion users until hydration. Fixed in CSS.
* Concurrent publishes could produce duplicate version numbers on servers without partial-index support. Added a portable sparse unique guard (12/12 stress runs clean).
* The DB integration check could delete real demo records. Now scoped to its own scratch records.

## Remaining differences (honest list)
1. Photographs/logo are extracted from the 941 px reference (upscaled 2×) → softer than originals. **Replace** via the media library.
2. The contact photo carries its "Trusted IT Partner" badge inside the picture (it overlaps the subject and could not be removed cleanly).
3. Amber headline highlight on white is ≈1.9:1 contrast (matches the design; large text needs 3:1). Editable in the theme.
4. Reference shows "© 2025"; the site shows the current year.
5. Blog nav link and Privacy/Terms footer links exist but are off, to match the design; turn them on in the CMS before launch (a privacy link is recommended).
6. Testimonial indicators are working controls; with 3 cards visible on desktop they select/highlight a card rather than scroll.
7. Per-section height deltas at 1440 px: −2…+7 px; page 2572 px vs 2558 px target.
