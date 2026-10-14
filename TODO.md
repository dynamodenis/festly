# Festly — Build Tracker

Phase-gated build. Only one phase runs per "Run Phase N". Commit after each phase passes its acceptance criteria.
Legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[?]` blocked / needs decision

## Decisions (locked)

| Concern             | Decision                                                                  | Date       |
| ------------------- | ------------------------------------------------------------------------- | ---------- |
| Framework           | TanStack Start 1.169.x (stable line, pinned) + React + TS strict          | 2026-10-14 |
| UI                  | shadcn/ui + Tailwind v4, ReactBits via `@react-bits/<Name>-TS-TW`         | 2026-10-14 |
| Validation / ORM    | Zod + Drizzle                                                             | 2026-10-14 |
| Database provider   | [?] ask at Phase 1 (Neon Postgres recommended · D1/Turso · Supabase)      |            |
| Object storage      | [?] ask at Phase 4 (R2 recommended · Supabase Storage · S3 · UploadThing) |            |
| Auth                | [?] ask at Phase 5 (Better Auth recommended · Clerk · WorkOS)             |            |
| Deployment          | [?] ask at Phase 8 (Vercel · Netlify · Cloudflare Workers · Railway)      |            |
| Map display default | google-embed iframe; adapters pluggable (rule 11)                         | 2026-10-14 |
| Geocoder default    | nominatim, server-side on submit, cached                                  | 2026-10-14 |

## Phase 0 — Project setup & smoke test ✅ 2026-10-14

- [x] Scaffold Start + shadcn (`pnpm dlx shadcn@latest init -t start -b radix -p nova`), Tailwind v4 + `@/*` alias confirmed
- [x] shadcn components added (form → `field` in shadcn v4; react-hook-form wrapper deferred to Phase 4 if needed)
- [x] `@react-bits` registry in components.json; BlurText + Aurora installed via CLI (`docs/REACTBITS_CATALOG.md` from MCP listing)
- [x] `/dev/smoke`: BlurText behind `<ClientOnly>` with plain-text SSR fallback, Aurora via `React.lazy` + `<ClientOnly>` over a static gradient, reduced-motion guard
- [x] ESLint (TanStack + react-hooks + jsx-a11y) + Prettier (+tailwind) + Vitest; scripts `typecheck`, `lint`, `format`, `test`
- [x] Folder structure (routes, components/ui, components/reactbits, templates/_shared/_, server/_, lib, hooks, docs)
- [x] `env.server.ts` / `env.public.ts` (renamed from `env.client.ts`: Start forbids importing `*.client.*` from isomorphic code) + `.env.example`
- [x] `docs/ARCHITECTURE.md`, `docs/CREDITS.md`, `docs/BUILD_PROMPT.md`, `README.md`
- Acceptance:
  - [x] `pnpm dev` serves `/` and `/dev/smoke`; SSR HTML contains the headline + gradient fallback, no `<canvas>` until hydration
  - [x] Aurora animates after hydration; JS-disabled page still styled (static gradient layer)
  - [x] `pnpm typecheck && pnpm lint && pnpm build` pass (build output in `dist/`, Aurora isolated in its own client chunk)
  - [x] ReactBits files came from the registry (commands recorded in `src/components/reactbits/README.md`)

## Phase 1 — Data model & Zod schemas

- [?] Choose DB provider first
- [ ] `InvitationConfigBase` schema + `MediaRef`
- [ ] `templates/types.ts` (`TemplateMeta`, `TemplateModule`)
- [ ] Drizzle schema (invitations, templates_meta, media_assets, rsvps, wishes, page_views, geocode_cache, guests)
- [ ] drizzle.config, migrations, seed
- Acceptance: `db:generate/migrate/seed` pass · schema unit tests (bad dates, colors, gallery>30) · jsonb typed via `$type<>`

## Phase 2 — Template engine + first 3 templates

- [ ] palettes (≥16), fonts (≥10 pairs, Fontsource), ThemeScope inline CSS vars, Tailwind `@theme` tokens
- [ ] Shared blocks: CoverGate, Hero, Countdown, EventDetails, MapSection, Gallery, StoryTimeline, RsvpForm, Wishes, GiftEnvelope, AddToCalendar, MusicPlayer, Footer
- [ ] Effects: BackgroundFx / TitleFx / GalleryFx (lazy + ClientOnly + motionLevel guard)
- [ ] TemplateRenderer + registry.ts
- [ ] Templates: wedding/ivory-garden · birthday/confetti-pop · graduation/cap-and-gown
- [ ] `/dev/templates/$id`
- Acceptance: SSR clean · no WebGL in initial chunk · motionLevel "none" removes effects · each template < 200 lines

## Phase 3 — Template gallery & preview

- [ ] `/templates` filters + search (typed search params)
- [ ] `/templates/$templateId` preview, device toggle via `/preview/$templateId`, palette switcher
- [ ] "Use this template" → draft row → `/editor/$id` (dev-user stub until Phase 5)
- [ ] `pnpm thumbs` (Playwright → `public/thumbs/*.webp`)

## Phase 4 — Editor

- [?] Confirm storage provider first
- [ ] Split-pane editor, schema-driven form + `fieldsUi`, debounced preview
- [ ] Presigned uploads (`createUploadUrl` / `confirmUpload`), client-side resize
- [ ] Music library + upload; colors + contrast check; fonts
- [ ] Map: `geocode` server fn (cache, Nominatim throttle), paste Google Maps URL, manual lat/lng; provider adapters per rule 11; `/dev/maps`
- [ ] Sections drag-reorder; autosave; publish + slug + share/QR/WhatsApp

## Phase 5 — Auth & dashboard

- [?] Choose auth provider first
- [ ] Email+password, Google OAuth (+magic link); `_authed` layout; fn middleware
- [ ] `/dashboard`, analytics, `/dashboard/$id/responses`, CSV export, guest list + personal links

## Phase 6 — Public invitation page

- [ ] `/i/$slug` SSR + OG head; `/og/$slug.png`; `/ics/$slug`
- [ ] CoverGate + music gesture start; share; map directions
- [ ] RSVP/wishes server fns: honeypot, Turnstile (optional in dev), rate limit
- [ ] Perf budget: < 150 KB gz JS before "open"

## Phase 7 — Scale to 50 templates (batches)

- [ ] `docs/TEMPLATE_AUTHORING.md` + `pnpm gen:template`
- [ ] Wedding (10) · Birthday (8) · Graduation (6) · Baby shower (6) · Anniversary (5) · Corporate (6) · Other (9)
- [ ] Per batch: checklist pass, thumbnails, contact sheet in `docs/batches/`

## Phase 8 — Polish & deploy

- [?] Choose deployment target first
- [ ] Perf, a11y, reduced-motion audit, i18n (en + id), tests (Vitest + Playwright + SSR no-window test), security (CSP, URL validation, owner checks)
- [ ] Deploy config + README

## Credits / licensing log

Record any concrete adaptation from permissive sources in `docs/CREDITS.md` (created in Phase 0).
