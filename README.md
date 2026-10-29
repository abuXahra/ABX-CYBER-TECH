# ABX CYBER TECH — Official Website, CMS and Admin Dashboard

Database-driven corporate website for ABX CYBER TECH (Abuja, Nigeria). Public content is rendered from validated, published revisions stored in MongoDB; administrators edit, preview, publish and roll back without redeploying.

> Status: **Phase 2 (public homepage)**. See `IMPLEMENTATION_PROGRESS.md` for what is built and verified.

## Stack
Next.js 15 (App Router) · React 19 · TypeScript (strict, 5.x) · Tailwind CSS 3 · Motion · MongoDB Atlas + Mongoose · Auth.js v5 · Argon2id · Zod · React Hook Form · Tiptap · Cloudinary · Vitest / Playwright.

## Architecture
- `src/lib/cms/` — Zod schemas, section registry, theme tokens, defaults, safe-link validation, published/draft readers.
- `src/lib/publishing/` — save draft, publish, discard, restore.
- `src/models/` — Mongoose models. Versioned content lives in `content_revisions`; `content_pointers` says which revision is live.
- `src/lib/auth/` — Auth.js config, Argon2id, throttling, `requireAdmin()`.
- `src/components/cms/` — section renderer and the renderer registry.

**Publishing model:** a draft is a mutable revision visible only to admins. Publishing validates it, inserts a new *immutable* published revision, then atomically swaps the pointer (guarded against concurrent publishes), writes an audit event and invalidates the cache tag. Visitors only ever read through the pointer. Rollback publishes a new revision copied from history.

## Setup
```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```
Generate `AUTH_SECRET` with `npx auth secret`. Keep `.env.local` out of Git.

| Command | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Develop / production build / serve |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Playwright layout / interaction / visual / demo tests (needs a running server: `PLAYWRIGHT_BASE_URL`, `EXPECT_DEMO`) |
| `npm run setup` | `seed` + `design:apply` (first-time database setup) |
| `npm run demo -- list\|remove\|convert\|publish` | Manage demo (sample) content |
| `npm run db:check` | Integration-check models and the draft/publish model against `MONGODB_URI` |
| `npm run placeholders:remove` | Remove the mockup's sample logos/testimonials/projects/contact details before launch |
| `npm run design:apply` | Publish the current default theme + homepage design as a new revision (idempotent, non-destructive) |
| `npm run seed` | Idempotent seed of services, FAQs and the initial published homepage |

## Environment variables
See `.env.example`. `MONGODB_URI`, `AUTH_SECRET`, `AUTH_URL`, `AUTH_TRUST_HOST` are needed now; Cloudinary and email variables are used in later phases. Never prefix secrets with `NEXT_PUBLIC_`.

## MongoDB Atlas
Create a cluster, a database user with read/write on one database, and allow your IP (and Vercel's egress, or `0.0.0.0/0` with a strong password). Use the `mongodb+srv://` string as `MONGODB_URI`. Indexes are created by Mongoose on first connection.

## Security notes
Server-side `requireAdmin()` on every admin operation (middleware is only a redirect); Argon2id; login throttling; allow-listed link protocols; no arbitrary HTML/JS/CSS or remote fonts in the CMS; theme values are regex/enum constrained; published revisions are immutable; admin and API routes send `noindex`.

## Troubleshooting
- **Site shows default content:** `MONGODB_URI` missing or unreachable; check server logs for `[cms] could not load …`.
- **`next.config.ts` fails to load:** make sure TypeScript is 5.x, not 7.
- **Redirect to `/admin/login` 404s:** the login page arrives in Phase 4.

Sections for CMS usage, media, theming, rollback and deployment will be expanded as those phases land.
# ABX-CYBER-TECH
