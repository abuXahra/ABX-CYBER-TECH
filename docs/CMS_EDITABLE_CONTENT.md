# What is editable from the database / admin dashboard

Nothing below is hardcoded in React; each value is loaded from MongoDB (published revision or collection record).
(The dashboard UI itself is Phases 4–8; today these are edited through the CMS data model, seed/CLI scripts and, later, the editor.)

**Site Settings** (`settings:site`): company name, tagline, description, mission, vision, CAC number, established year, location, email, phone, WhatsApp, website, address, social links, header logo, footer logo, favicon, footer text, SEO defaults, **demo contact block**.
**Navigation** (`navigation:main`): header labels/links/order/visibility, CTA button, footer quick links, legal links.
**Theme** (`theme:global`): all colours (incl. cyan/tint), heading/body fonts, scales, weights, line height, radius, shadow, section spacing.
**Homepage sections** (`page:home`, each: show/hide, order, variant, background colour/gradient/image, text colour, padding, width, animation preset/duration/delay):
* Hero — eyebrow, headline (with line breaks + highlighted phrase), description, both buttons (label/link/style/visibility), device composition image, mobile image, **laptop screenshot, phone screenshot**, badges (icon+text), caption, floating motion.
* Credibility strip — heading, verified items, partner logos (name, image or icon, reorder, demo flag), logos heading.
* Services grid — eyebrow, heading, description, limit, title-break option. (Cards: **services collection** — name, slug, description, icon, image, order, publish.)
* About — eyebrow, heading, body, mission, registration note, photo, photo caption, four highlights (icon/title/text), button.
* Portfolio — eyebrow, heading, description, button, count, hide-when-empty. (Cards: **projects collection**.)
* Testimonials — eyebrow, heading, autoplay/interval. (Cards: **testimonials collection** incl. avatar.)
* Call to action — eyebrow, heading, description, two buttons, gradient.
* FAQ — eyebrow, heading, multi-open; promo card (eyebrow, heading, text, button, photo, badge). (Items: **faqs collection**.)
**Media library** (`media_assets`): upload/replace images, alt text, tags, focal point, demo flag.
**Versioning:** draft → preview → publish → restore for every item above (page, theme, navigation, settings).

## Demo content (sample) — `isDemo: true`, `isPublished: false`
Visible only in development or when `SHOW_DEMO_CONTENT=true`. Actions (backend + CLI `npm run demo -- …`): replace, convert to genuine (`--verified`), publish genuine, unpublish, remove all demo content.
