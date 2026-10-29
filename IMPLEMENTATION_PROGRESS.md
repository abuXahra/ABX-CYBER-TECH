# ABX CYBER TECH — Implementation Progress

## Phase 1 — Foundation and CMS architecture · STATUS: complete (with limits below)

### Done
- Next.js 15 (App Router) + React 19 + TypeScript strict, Tailwind 3, Motion, Zod, Mongoose, Auth.js v5.
- Database-driven design tokens: `src/lib/cms/theme.ts` (schema, defaults, WCAG contrast checks, CSS-variable output). Tailwind colours resolve to CSS variables; the root layout injects the published theme.
- Typed section registry for all 10 section types (`sections.ts`, `registry.ts`): each has content, style and animation schemas plus variants. Unsafe links, unknown types, duplicate IDs and missing alt text are rejected.
- Draft/publish model (`src/lib/publishing/publish.ts`): immutable published revisions + one atomic pointer swap with optimistic concurrency, audit event and cache-tag invalidation. Restore creates a *new* revision. Theme publishing is blocked on contrast failures.
- Public read path (`content.ts`) only follows the pointer; draft reads require `requireAdmin()`. Invalid or missing content falls back to safe defaults.
- Auth infrastructure: Credentials provider, Argon2id hashing, DB-backed login throttling (5 failures → 15 min lock), `requireAdmin()` server-side guard, edge middleware redirect, 8-hour JWT sessions.
- Mongoose models for every PRD collection that is not folded into revisions; security headers; `X-Robots-Tag: noindex` on `/admin` and `/api`.
- UI primitives (Button, Container), `Reveal` animation helper (reduced-motion aware).

### Architecture refinement (allowed by PRD §15)
`theme_settings`, `settings`, `navigation_menus` and `page_sections` are **not** separate collections. Their content lives in `content_revisions` (scopes `theme`, `settings`, `navigation`, `page`), with `content_pointers` marking what is live. Added `login_attempts`.

### Verified (actually run)
- `npx tsc --noEmit` — passes.
- `npx vitest run` — 23/23 pass (safe links, contrast, theme/CSS-injection rejection, section schemas, registry, defaults, no "quote" wording).
- `npx next build` — passes with **no database configured**, exercising the safe-default fallback.

### NOT verified
- Anything that talks to MongoDB: publishing, drafts, pointer swap, login, throttling, `requireAdmin()`. They compile and are written to spec, but no database was available. Needs a real `MONGODB_URI`.
- Cloudinary, email, Vercel: not started.

### Known items / blockers
- `/admin/login` does not exist yet (Phase 4). Middleware redirects there, so it currently 404s.
- No section renderers yet (Phase 2); homepage shows an empty-state message until then.
- Build prints Edge-runtime warnings from `jose` (Auth.js dependency) in middleware. Non-fatal; re-check in Phase 11.
- Strict CSP deferred to Phase 11 (needs nonces).
- Hero/About images: the mockup's photos are not assets in the repo. Needs supplied images or Cloudinary uploads.
- Verified contact details (phone, email, WhatsApp, domain) still needed. Seeded empty.
- Toolchain note: TypeScript is pinned to 5.x because TS 7 breaks `next.config.ts` loading in Next 15.

### Next: Phase 2 — public homepage (registers renderers in `section-components.ts`, seed script for services/FAQs).

---

## Phase 2 — Public homepage · STATUS: built; verified against a LOCAL MongoDB-compatible DB only

### Built
- Homepage rendered entirely through the Phase 1 section registry (`components/cms/section-components.ts`): hero, credibility band, services grid, about, portfolio, testimonials, call-to-action, FAQ. Header (sticky, blur, animated underline, active page, accessible mobile menu) and footer come from CMS navigation/settings.
- Scroll reveals, staggered cards, hero float, card lift/icon animation, image zoom, portfolio overlay, testimonial scroll-snap carousel, FAQ accordion (WAI-ARIA, inert when closed). All honour `prefers-reduced-motion`; a `<noscript>` rule keeps content visible without JS.
- Hero/About use original SVG illustrations (theme-token coloured) until a media-library image is chosen; images then replace them automatically.
- Portfolio and testimonials hide when nothing is published. Nothing fabricated; contact rows/social links render only when a verified value exists.
- Idempotent seed `npm run seed` (services, FAQs, pages via `$setOnInsert`; theme/settings/navigation/home published through the real publishing core as the `system:seed` actor). `npm run db:check` integration-tests models and the publish model.
- Publishing split into `publishing/core.ts` (no auth) + `publish.ts` (requireAdmin + cache invalidation). Revisions gained `source` and nullable `createdBy` for system actions.
- Error handling: DB failure or corrupt page content now shows an explicit, logged outage panel (never an empty/default homepage). "Nothing published yet" serves approved defaults with a loud warning.

### Verified (actually run)
- `tsc --noEmit` clean; `vitest` 33/33; `next build` passes.
- Against a **local FerretDB 1.24 (SQLite)** — MongoDB wire-compatible, NOT MongoDB/Atlas:
  - `db:check`: connection, draft save, publish v1/v2, pointer, previous-revision links, immutability (update+delete blocked), restore as new revision, discard, concurrent-publish race (1 winner, no duplicate versions), audit events — all PASS.
  - seed run twice: second run changed nothing.
  - Production server over HTTP: all expected sections render in CMS order; five services; no quote/Digital Marketing wording; no invented contacts; theme CSS variables injected from the DB revision.
  - Draft stayed private; publish changed the live headline; restore returned the original and kept history (v1, v2, v3).
  - DB unreachable → outage panel + `noindex` + logged error. Unseeded DB → defaults + warning.

### NOT verified
- **MongoDB Atlas.** The sandbox cannot resolve `cluster0.uzuli.mongodb.net` (`querySrv ENOTFOUND`, network allow-list). Run `npm run db:check` and `npm run seed` from your machine.
- Features FerretDB lacks, so untested: partial unique indexes (one-draft-per-target, unique published version), TTL index (login throttle expiry), text index (media search). Atlas supports them; Mongoose will create them on first connect.
- **No browser was available** (Playwright download blocked). Mobile/desktop layouts, visual fidelity vs the reference, animations, hover effects and the mobile menu were NOT tested in a browser. Only server-rendered HTML and unit/SSR tests were run.
- Tag-based cache invalidation on publish (`revalidateTag`) needs an admin session (Phase 4/5). In tests the data cache (`.next/cache/fetch-cache`) was cleared by hand to emulate it.
- Cloudinary-backed images and the Admin editor.

### Known issues / decisions
- Outage panel returns HTTP 200 (Next pages cannot set a status code) with `noindex`; alert on the `[home] content unavailable` log line.
- Publishing from outside the Next process (scripts) does not invalidate the cache; use the dashboard (Phase 5) or wait ≤1 h (pages) / ≤5 min (collections).
- FAQ answers and service descriptions are drafts derived from the PRD; owner should confirm wording.
- `rich-text` and `contact-panel` renderers are Phase 3.
- **Security:** the Atlas password was pasted into chat. Rotate it in Atlas and keep it only in `.env.local`/Vercel env vars.

---

## Phase 2 — Open issue: dev-overlay `TypeError: frame.join is not a function` · STATUS: NOT RESOLVED (not reproducible here)

Reported on the user's machine: Next.js 15.5.28 dev overlay, `Runtime TypeError: frame.join is not a function`, 17 ignore-listed frames, opened via `http://172.28.64.1:3000`.

### Verified facts
- The throwing code is **inside Next's vendored React Flight client** (`next/dist/compiled/react-server-dom-webpack*/…client.*.development.js`, function `buildFakeCallStack`, line `frame.join("-")`). It is **dev-only** debug-stack code that expects every stack frame sent by the server to be an array.
- It is **not** from this repository: every `.join()` in `src/` and `scripts/` is called on an array built on the previous line. No Motion / framer-motion frame is involved.
- Next uses its own bundled React (19.2.0-canary) for both RSC and SSR layers (measured); `node_modules` React 19.3.1 is not loaded by the App Router. 15.5.28 is the newest 15.5.x on npm.
- Not triggered by any single homepage section, the header/footer chrome, server `console.*` calls (warn / error / Error objects / after `await`), a non-localhost origin (Next only warns), or running dev on top of a production `.next`.
- Real Next client bundles executed in **jsdom** (not a real browser) against the dev server: all 6 sections hydrate, no error overlay, no `frame.join`.
- Observed **once** on the very first dev start in this sandbox (two paired server errors: `frame.join` and `chunk.reason.enqueueModel is not a function`); never again in ~6 clean attempts, so the trigger is unidentified.

### NOT verified
- No real browser available here → mobile/desktop layout, scroll animations and hover effects are still untested visually.
- Windows-specific behaviour (paths, WSL address) cannot be reproduced from this Linux sandbox.

### Changes made for this investigation
- Added `tests/flight-safety.test.tsx` (21 tests): CMS data crossing the server→client boundary is plain JSON; malformed animation/order values are rejected; every animation preset renders through Reveal/Stagger/Float. These are guards, **not** proof of a fix.
- Temporary debug routes were removed. No application code changed.

### Next step (needs the user)
Collect: the expanded stack ("Show 17 ignore-listed frames"), `npm ls next react react-dom`, whether the error appears on `http://localhost:3000`, in an Incognito window with extensions disabled, after deleting `.next`, and whether `npm run build && npm start` is clean. Phase 3 is blocked until this is understood.

---

## Phase 2 — Homepage redesigned to the approved mockup (ABX_Cyber_Tech_Website_Mockup.png)

### Reproduced from the mockup
Light pale-mint hero with decorative circles + laptop/phone artwork + handwritten caption (new bundled Caveat font, caption only); amber/outline pill buttons; slim credibility strip; five service cards in one row (whole card is the link; arrow appears on hover/focus); About with image-left + caption badge + 2×2 icon grid; mint portfolio band; teal CTA band; FAQ as separate rounded rows beside a "Let's Bring Your Ideas to Life" promo card; four-column dark footer with social icons under the brand; dark headings, teal eyebrow labels, mint surface (theme tokens updated: surface #EAF6F5, heading #10252A, body #475569 — all contrast checks pass).

### Deliberately NOT reproduced (PRD rules 3 & 10 — fabricated or unverified)
Six client logos and the "Trusted by businesses, startups and organizations across Nigeria" line; three testimonials; three portfolio projects; footer phone/email/website; "Trusted IT Partner" badge (replaced by the truthful "CAC Registered / Abuja, Nigeria"); the photographs (replaced by original theme-tinted illustrations until images are uploaded). Portfolio and testimonials render automatically once real records are published.
PRD-driven differences from the mockup: nav keeps a Blog link (PRD §6.1; hideable in CMS); About keeps the mission statement as a light text line; Privacy/Terms links sit in the footer bar.

### New / changed
- Schema (backward compatible, defaults keep old published content valid): hero `caption`; FAQ `promo` + `split-promo` variant; icons `tag`, `badge-check`, `headset`.
- `npm run design:apply` — idempotent; publishes the new theme + homepage as a NEW revision through the publishing core; skips if already current; refuses to override an administrator's revision without `--force`. Existing databases need this (the seed deliberately never overwrites).
- Tests: 60 passing (added: mockup section order, promo card, no fabricated names/claims, backward compatibility with pre-redesign content, footer shows contacts/social only when set).

### Verified (actually run)
`tsc` clean · 60/60 tests · production build · served over HTTP from a local MongoDB-compatible DB (FerretDB): sections in mockup order, headline highlight, caption, promo card, theme variables from the DB revision, no forbidden strings · `design:apply` run twice (v-new then no-op, history kept) · dev server from a clean `.next`: 0 server errors; real Next client bundles in jsdom: all sections present, no overlay, no `frame.join`.

### NOT verified
- **Pixel/visual fidelity to the mockup, responsive layouts, scroll animations, hover effects, mobile menu:** no real browser is available here. Compare in a browser and report differences.
- Atlas (unreachable from the sandbox). The earlier `frame.join` dev-overlay report is still unresolved/unreproduced (see above); it needs the information requested there.

---

## Phase 2 — Full mockup copy with editable placeholders (owner-approved)

Per the owner's instruction ("copy everything from the design … placeholders changeable from the database"), the homepage now reproduces **every** element of the mockup. Items that are not verified company data are **sample placeholders**, stored in MongoDB, flagged `placeholder: true`, editable like any record, and removable in one step. They must be replaced or removed before launch (PRD rule 3 still applies to the live site).

### Sample (placeholder) content
- 6 client marks (TechStart, KoyaMart, HealthPlus, EduBridge, LogiTrack, FinanceHub) + "Trusted by businesses, startups and organizations across Nigeria" heading — icon + name marks in the homepage content; replace with real logos via the media library.
- 3 testimonials (Ahmed Musa, Fatima Bello, Ibrahim Lawal) — `testimonials` collection, avatars optional.
- 3 projects (Business Website, Mobile App, E-commerce Platform) with original SVG thumbnails served from `/public/placeholders` and registered as `media_assets` records.
- Footer: +234 803 133 4567, info@abxcybertech.com, www.abxcybertech.com, five social links (platform home pages) — Site Settings.
- Promo badge "Trusted IT Partner / Abuja, Nigeria".
All of the above are **unverified** and appear on the public homepage once `npm run design:apply` has been run.

### Commands
- `npm run design:apply` — idempotent; publishes theme, navigation, settings and homepage as new revisions, rewords untouched seed FAQs to the mockup wording, and adds the sample records. `-- --no-placeholders` skips samples; `-- --force` overrides an administrator's revision.
- `npm run placeholders:remove` — deletes flagged sample records and blanks/removes sample values **only where they still equal the sample values** (admin edits preserved).

### Mockup fidelity changes in this pass
Hero device screens carry the mockup's copy; credibility logo row; testimonials with role/company; promo card with person illustration and badge; footer website row; header without Blog and footer without Privacy/Terms (both exist and are switched **off** in navigation — enable in CMS; a privacy policy link is recommended for a live site); About shows no mission line (mission remains in Site Settings, to appear on the About page in Phase 3); FAQ and portfolio copy now match the mockup exactly.
Known deviation: testimonial dots/arrows appear only when the carousel can actually scroll (with 3 cards on a wide screen it cannot), to avoid non-functional controls.

### Verified (actually run)
`tsc` clean · 73/73 tests · production build · local MongoDB-compatible DB (FerretDB): `design:apply` twice (second run a no-op), `placeholders:remove` (samples deleted, real services/FAQs/CAC kept, page drops to 6 sections), re-apply (back to all 8) · served-page checks of every mockup element over HTTP · dev server from clean `.next`: 0 server errors; Next client bundles in jsdom: all 8 sections, no overlay, no `frame.join`.

### NOT verified
Pixel-level match to the mockup, responsive behaviour, animations/hover, mobile menu (no real browser here) · MongoDB Atlas (unreachable from the sandbox) · the earlier `frame.join` overlay report remains unreproduced/unresolved.


---

## Phase 2 UI/UX CORRECTION (mandatory) — supersedes the earlier "mockup copy / placeholders" sections

See `docs/VISUAL_DISCREPANCY_CHECKLIST.md` (what was wrong and why) and `docs/CMS_EDITABLE_CONTENT.md`.

### Implemented
* Layout engine: desktop breakpoint 900 px; from 900 px every rem scales with the viewport (1440 px = 16 px root) so the approved 1440 px composition keeps its proportions; container 76.5 rem.
* Fixed the real layout bug (grid/flex applied to the reveal wrapper's parent) in `SectionShell`; per-section error boundary; carousel crash fixed.
* Every section rebuilt to the reference's measurements (see checklist). Real image assets extracted from the approved design into `public/demo` and registered as media records; approved logo lockups used in header/footer.
* Hero device composition is a CMS image; optional CSS device frames with replaceable laptop/phone screenshots.
* Theme tokens sampled from the reference (amber `#FCAA2B`, teals, mint, cyan/tint, dark heading), body font Plus Jakarta Sans.
* **Demo architecture:** `isDemo` / `isPublished` on projects, testimonials, media; demo logos, demo contact, demo imagery; visibility switch (`SHOW_DEMO_CONTENT`); model-level rule that a demo record cannot be published; admin operations (replace / convert-after-verification / publish / unpublish / remove) in `src/lib/demo/core.ts` + dashboard-ready wrappers + CLI; idempotent seeds that never overwrite (`$setOnInsert`); `design:apply` publishes new revisions only (history kept) and skips admin-published revisions without `--force`.
* Publishing: added portable sparse-unique version guard (concurrent publishes 12/12 clean).

### Verification (actually run)
* `tsc --noEmit` clean · Vitest 78/78 · `next build` passes.
* **Playwright (real headless Chromium 153) 29/29 + demo spec in both modes:** section heights/page height vs reference (±6 %), section order, hero two-column geometry, logo image + amber button colour, card columns, no overflow/errors at 1920/1440/1280/1024/900/768/390/375, reflow + nav modes, scroll reveal, reduced motion, stagger, sticky header, hover (cards, portfolio zoom/overlay, buttons, nav underline), mobile menu, accordion, carousel indicators, 1 px resize regression, keyboard/skip link, visual comparison vs reference (mean abs diff **0.045–0.050**; old build 0.227).
* Production-style run (`SHOW_DEMO_CONTENT=false`): no demo logos/testimonials/projects/contact/imagery; verified facts present.
* DB integration (local MongoDB-compatible server): publish model + 10 demo-operation checks pass; 3 failures are index options the stand-in lacks (partial/TTL/text).
* Dev server in real Chromium: 0 console errors, no overlay, no `frame.join`.

### NOT verified
MongoDB Atlas (unreachable from the sandbox) · Windows machine · real Safari/Firefox · pixel-exact photographic fidelity (assets are 941 px-resolution extracts) · admin dashboard UI for demo actions (Phases 4/8) · the user's earlier `frame.join` overlay report could not be reproduced (dev mode is clean here).


---

## Homepage spacing refinement (spacious / premium) — design unchanged

See `docs/SPACING_SYSTEM.md`. Same design, colours, images, typography, layout structure and CMS; only whitespace changed.

* Spacing is now **token-driven**: theme `spacing.section` / `spacing.card` → CSS variables (desktop / tablet / mobile); every section's default padding is a per-type multiplier of `--section-y`; the editor's per-section Padding setting scales the same token. Previously the components ignored the token (hardcoded rem). No stored revision was rewritten, nothing deleted; published themes without `spacing.card` stay valid.
* Hero: balanced two-column layout (text centred against the mockup), devices unchanged at 856px wide / uncropped, 76px navbar→content, space around the mockup; image edges feathered so it floats cleanly.
* Services/portfolio/testimonials: 24px card gaps, 28px card padding, equal card heights; About 56px column gap, centred; FAQ 64px column gap, roomier accordion rows; CTA 70px banner; footer roomier; credibility strip 44px.
* Also fixed during review: footer-logo halo (re-extracted), stray text baked into the contact photo (inpainted), FAQ photo overlap/clipping on desktop and phones, accidental FAQ font-size change (reverted).

### Verification (actually run)
* `tsc` clean · Vitest **85/85** (new: spacing tokens vs guideline ranges, backward compatibility, token-driven section padding, editor padding override) · `next build` passes.
* **Identity test** (`tests/e2e/identity.spec.ts`, snapshot captured BEFORE the change): 244 typography/colour/radius/size properties compared — unchanged (only line-height and card/section heights differ, by design).
* Playwright (real Chromium): spacing guidelines at 1440 (section padding 88px, CTA 70px, card gap 24px, card padding 28px, equal card heights, hero rhythm, footer), tablet 768 and mobile 390/375 padding + gutters + no overflow, interactions (reveal, reduced motion, stagger, sticky header, hovers, mobile menu, accordion, carousel, 1px-resize regression, keyboard), demo visibility in both modes.
* Measured at 1440/1280/1024/768/390/375: no horizontal overflow, no runtime errors.

### Notes
* The old "page matches reference height/pixels" tests were removed: the page is intentionally taller (3981px vs 2572px at 1440; 7788px vs 6472px at 390). Identity is enforced by the snapshot test instead. A per-section pixel comparison (padding trimmed) is near-identical where internal layout is unchanged (hero 0.03, credibility 0.05, services 0.05, testimonials 0.05, CTA 0.06); About/Portfolio/FAQ changed internally on purpose.
* Tablet at 1024px keeps the scaled-desktop layout (padding ~63px, gaps ~17px) — slightly below the 64–80px tablet guideline because desktop values scale with the viewport.
* NOT verified: MongoDB Atlas, Windows, other browsers, admin editor UI (later phases).
