# Festly — Build Tracker

Phase-gated build. Only one phase runs per "Run Phase N". Commit after each phase passes its acceptance criteria.
Legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[?]` blocked / needs decision

## Decisions (locked)

| Concern             | Decision                                                                  | Date       |
| ------------------- | ------------------------------------------------------------------------- | ---------- |
| Framework           | TanStack Start 1.169.x (stable line, pinned) + React + TS strict          | 2026-10-14 |
| UI                  | shadcn/ui + Tailwind v4, ReactBits via `@react-bits/<Name>-TS-TW`         | 2026-10-14 |
| Validation / ORM    | Zod + Drizzle                                                             | 2026-10-14 |
| Database provider   | Neon Postgres via node-postgres (pooled URL); Drizzle ORM                 | 2026-10-14 |
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

## Landing page ✅ 2026-10-14

- [x] Gold/brown marketing page at `/` (`src/components/landing`), brand type utilities in `styles.css`, `ButtonLink` in `src/components/brand`
- [x] Hero uses a CSS-only backdrop: ReactBits Aurora rendered an opaque white wash under SwiftShader/llvmpipe (also on `/dev/smoke`); revisit on real GPUs

## Phase 1 — Data model & Zod schemas ✅ 2026-10-14

- [x] DB provider: Neon Postgres (node-postgres driver over the pooled URL; swap to `neon-http` only if Phase 8 picks Workers)
- [x] `InvitationConfigBase` schema + `MediaRef` (`src/templates/_shared/schema/base.ts`), sample config (`sample.ts`)
- [x] `templates/types.ts` (`TemplateMeta`, `TemplateModule`, categories)
- [x] Drizzle schema `src/server/db/schema.ts` (users placeholder, invitations, templates_meta, media_assets, rsvps, wishes, page_views, geocode_cache, guests) with slug/status/party-size checks
- [x] `drizzle.config.ts`, `drizzle/0000_init.sql`, idempotent seed (`src/server/db/seed.ts`, `pnpm db:seed`)
- Acceptance:
  - [x] `db:generate && db:migrate && db:seed` succeed against Postgres 17 (seed run twice); `db:check` clean
  - [x] Unit tests: sample parses; rejects bad dates (non-ISO, no offset, end<start, bad tz), bad colors (hex/oklch only), gallery > 30, non-http links
  - [x] jsonb typed via `$type<InvitationConfigBase>()`; PGlite test runs real migrations + seed and checks constraints and cascades
- Deviation: venue omits `mapEmbedUrl`/`directionsUrl` (rule 11: adapters derive them from lat/lng/address)

## Phase 2 — Template engine + first 3 templates ✅ 2026-10-20

- [x] Theme: `palettes.ts` (20 presets, all WCAG AA-checked in tests), `fonts.ts` (12 Fontsource pairs; `fonts.css` declares all faces, browsers fetch only the ones used), `ThemeScope` sets `--inv-*` inline; Tailwind `@theme inline` tokens (`bg-inv-bg`, `text-inv-primary`, `font-inv-display`, `rounded-inv`) + derived `--inv-muted/-line/-surface`
- [x] Blocks (`_shared/blocks`, 2–3 variants each): CoverGate, Hero, Hosts, Countdown (`useNow` store; placeholders on server), EventDetails, MapSection (lazy iframe + address card + Google/Waze/Apple links), Gallery (grid/masonry/carousel + Dialog lightbox), StoryTimeline, RsvpForm, Wishes, GiftEnvelope (copy + QR + registry), AddToCalendar (Google + `/ics/$slug`), MusicPlayer (single Audio in effect, "Tap to play" on rejected play), Closing + Footer, Divider (SVG), `Sections` (renders `sectionsOrder`, honours `features`)
- [x] Effects (`_shared/effects`): BackgroundFx (aurora|silk|particles|iridescence|waves|none; static gradient always, canvas lazy + ClientOnly at motion "full" only), TitleFx (split|blur|shiny with plain heading fallback), GalleryFx (TiltedPhoto, PhotoCarousel), Reveal (FadeContent). ReactBits fetched via CLI: Silk, Particles, Iridescence, Waves, SplitText, TiltedCard, Carousel, FadeContent
- [x] Context: `InvitationProvider` / `useInvitation()` carries config, mode, effective motion, palette, slug, guestName, wishes, actions (`submitRsvp`/`submitWish` injected in Phase 6) and the cover `opened` flag that starts music
- [x] `registry.ts` (sync metas + lazy loaders), `resolveConfig` (safeParse → merge defaults → defaults, logged), `TemplateRenderer` (lazy view per id + Suspense) + `TemplateRendererSkeleton`, `defineTemplate()` erases extended schema types
- [x] Templates: `wedding/ivory-garden` (Silk, SplitText, leaf dividers, TiltedCard gallery, split cover), `birthday/confetti-pop` (`age` extension, confetti Particles, BlurText, ring countdown, Carousel), `graduation/cap-and-gown` (`graduation{school,degree,classOf}` extension, Aurora, ShinyText "Class of", milestones grid)
- [x] `/dev/templates` index + `/dev/templates/$` (splat id) with typed search params: `mode`, `motion`, `palette`, `font`, `guest`
- [x] `src/lib`: `format-date`, `countdown`, `calendar` (Google + ics path), `maps/{types,directions,google-embed}` (rule 11 seed; other adapters + `/dev/maps` in Phase 4), `music-library` (ids only; files in Phase 4), `deep-merge`; hooks `useHydrated`, `useNow`
- Acceptance:
  - [x] SSR clean: node-environment test renders every template with `renderToString` (no `window`), Playwright run on all 3 × motion full/none shows zero console errors/hydration warnings
  - [x] Readable without JS: cover is a normal first screen on the server (`data-state="inline"`), becomes a fixed gate only after hydration in public mode
  - [x] No WebGL in initial chunk: build emits Aurora/Silk/Particles/Iridescence/Waves/SplitText/Carousel/TiltedCard as separate lazy chunks
  - [x] motionLevel "none" removes effects: `data-fx="static"` everywhere, 0 `<canvas>` in the browser; OS reduce-motion also collapses to "none"
  - [x] Each template < 200 lines (145 / 143 / 166); blocks shared, no duplicated block code
  - [x] `pnpm typecheck && pnpm lint && pnpm test && pnpm build` green (95 tests)
- Notes / deviations:
  - Aurora under SwiftShader renders a bright wash (same as the landing finding); the canvas now blends `multiply` (light) / `soft-light` (dark) over the gradient so it tints rather than covers. Re-check on a real GPU.
  - `RsvpForm`/`Wishes` call actions from context; without them (preview or Phase < 6) they toast "Preview mode" and never pretend to send.
  - Music chip sits bottom-left so it does not collide with TanStack devtools in dev.
  - The CLI pinned `gsap` to `^3.13.0`; restored to `^3.15.0` (installed 3.15.0, SplitText plugin is free since 3.13).

### Phase 2 review pass (2026-10-20)

- [x] Fixes: context no longer re-renders every block (stable `wishes`/`actions` defaults); blur title no longer nests `<p>` in `<h1>` (SplitText `blur` effect renders the heading tag itself); gallery tilt cards no longer nest a `<figure>` in a `<button>` (TiltedCard is the button); countdown `<dt>` precedes `<dd>`; dev route search params `.catch()` instead of throwing
- [x] Accessibility: gated cover is `role="dialog"` + `aria-modal`, focuses its button, hands focus to `#inv-content` on open, exits instantly without motion and has a timer fallback for `transitionend`; RSVP choice cards show a focus ring; lightbox has prev/next buttons, arrow keys and a counter; countdown reads one static sentence to screen readers
- [x] Standardised block API: every section block takes `BlockProps` (`eyebrow`, `title`, `tone`, `className`); `Section` adds `tone` (`plain | surface | tint`), `decor` and `aria-labelledby`; `CoverGate`/`Closing` take `crest` + `decor`; `theme.ornament` now drives `<Divider />` (falls back to `meta.ornament`); contract documented in `src/templates/_shared/README.md`
- [x] Decor kit (`_shared/decor`): `Flourishes`, `Monogram`, `Seal`, `ConfettiField`, `StarField`; seeded PRNG keeps SSR and client identical; center-clearing mask keeps ornaments off headlines
- [x] CSS: `inv-foil`, `inv-frame`, `inv-grain`, tone bands, `inv-anim-*` gated by `data-motion` and OS reduce-motion
- [x] Redesigns: Ivory Garden (monogram, corner flourishes, hero frame, arch portraits, mosaic gallery, paper grain), Confetti Pop (static confetti field under the particles, sticker age badge with spinning ring, ring countdown with progress arcs), Cap & Gown (star field, foil "Class of", diploma card with rosette seal, four-column countdown)
- [x] Tests: 109 (palette secondary contrast for tint bands, ornament resolution, seeded decor determinism, SSR determinism and `data-motion`)

## Phase 3 — Template gallery & preview ✅ 2026-10-20

- [x] `/templates`: hero search (debounced, `/` to focus), sticky category pills with live counts, phone-shaped cards (thumbnail, palette dots, shine + "Live preview" on hover), result count (`aria-live`), empty state, "Coming soon" list from the Phase 7 roadmap (`UPCOMING_TEMPLATES`, kept disjoint from the registry by a test)
- [x] Typed search params: `validateSearch` with Zod 4 (`.default().catch()`), `stripSearchParams` keeps URLs clean; bad values fall back instead of throwing
- [x] `/templates/$category/$slug`: info panel (tags, palette radio group with arrow keys, type + motion specs), live preview in a scaled phone / tablet / browser frame (`DeviceFrame`, real CSS widths 390 / 820 / 1440), device toggle in `?device=`, palette in `?palette=`
- [x] `/preview/$category/$slug`: bare render with sample content, `noindex`, `?palette|font|motion|device` overrides; listens for `festly:theme` messages
- [x] `src/lib/preview-bridge.ts`: typed, same-origin, Zod-validated postMessage channel (`theme`, `ping`, `ready` handshake); palette switches recolor the iframe without reloading (Phase 4 editor reuses it)
- [x] "Use this template": `createDraftFn` (POST, Zod validator) → `createDraft()` (template defaults + chosen palette, re-parsed with the template schema; upserts the `templates_meta` FK row) → `/editor/$invitationId` stub that loads the draft via `getDraftFn` (owner-scoped)
- [x] Auth stub: `requireUserId()` in `src/server/auth/current-user.server.ts` returns the dev user outside production (`ALLOW_DEV_USER=true` to allow in prod demos); Phase 5 swaps the body
- [x] `pnpm thumbs` (`scripts/thumbs.ts`): 390×844 @2× from `/preview?motion=none`, WebP encoded in the browser (no image dependency), hides dev chrome; thumbnails committed under `public/thumbs/`
- [x] Seed rows now derive from `TEMPLATE_METAS` (registry is the single source of truth)
- [x] Landing CTAs and nav link to `/templates` via `BrandLink` (router-aware `ButtonLink`)
- Acceptance:
  - [x] Typed search params (validateSearch + Zod) on `/templates`, `/templates/$category/$slug`, `/preview/...`
  - [x] Preview LCP < 2.5 s desktop dev (warm): Confetti Pop ≈ 0.2–0.3 s, Cap & Gown ≈ 0.2–0.5 s, Ivory Garden ≈ 1.7–2.1 s (its LCP is the external sample photo). Cover headlines now lift without fading so they count as painted immediately
  - [x] "Use" creates a DB row: `drafts.test.ts` runs `createDraft` against migrated PGlite (row, owner, status `draft`, palette, schema-valid config, FK row, owner isolation); browser click verified the RPC + error path against an unreachable DB (no writes to Neon)
- Notes / deviations:
  - Routes are `/templates/$category/$slug` and `/preview/$category/$slug` instead of a single `$templateId` (ids contain a slash; two typed params beat a splat)
  - Sample photos come from picsum.photos; real stock or uploaded photos arrive with Phase 4 storage

## Phase 4 — Editor ✅ 2026-10-20

- [x] Decisions: storage **Cloudflare R2** via aws4fetch (no AWS SDK); music = Festly library + host uploads (own `<audio>`, start on the cover tap) + SoundCloud link (visible widget). Research: `reports/Background music catalogs for invitations.md`
- [x] Storage (`src/server/storage`): `StorageDriver` with R2 (presigned PUT, Content-Type signed, 10-min TTL, HEAD/DELETE) and a dev-only local driver (`.storage/`, HMAC-signed PUT route, Range-capable file route). Setup guide: `docs/STORAGE.md`
- [x] Uploads: `createUploadUrlFn` → browser PUT → `confirmUploadFn` (owner-prefix check, HEAD re-check of size/type, delete on violation, `media_assets` row). Client resize to ≤ 2400 px WebP, quality stepping to ≤ 800 KB (JPEG fallback where WebP encoding is missing)
- [x] Music: schema `source` = library | upload (`rightsConfirmedAt`) | soundcloud (reference only). Music controller in context so `play()` runs inside the cover tap; Samsung pointerdown unlock; pause on hidden tab; "Tap to play" fallback. SoundCloud resolver (keyless oEmbed, short links, playlist rejection) + docked visible widget (loops on FINISH, "Tap ▶" hint after 1.5 s, minimizing pauses). Footer credit line. Library manifest (`src/lib/music-library.json`, Zod-validated) + `pnpm music:add|list|placeholders`; `/media/library/<file>` redirects to storage
- [x] Maps (rule 11): display adapters google-embed (default, SSR iframe) · google-js · mapbox · radar (plugin-maps) · leaflet (OSM), lazy registry with key checks + address-card fallback; geocoders nominatim (UA + contact, global 1 req/s) · google · mapbox · radar with a contract test; `geocode_cache` by sha256 of normalized query; Google Maps link parser (pin/viewport/query/OSM) + server-side short-link expansion; `/dev/maps`
- [x] Editor (`/editor/$invitationId`): 11 tabs (Basics, People, Event & Venue, Design, Music, Texts, Sections, Gallery, Story, Gifts, Sharing), template extension fields via `fieldsUi`, per-field Zod errors + tab badges, brand theme (`.theme-festly`), Edit/Preview toggle on phones
- [x] Live preview: device frame iframe fed by `festly:config` postMessage (throttled 200 ms); invalid edits repair only the failing fields (`resolveConfig` "repaired") instead of jumping to sample content
- [x] Autosave 1.5 s → `saveDraftFn` (template-schema Zod, ownership, ms-precision `updated_at` conflict → Reload / Keep mine), Ctrl/Cmd+S, unload warning
- [x] Design: 20 palettes + custom 5 tokens with live WCAG AA check (body, accents, tint bands), font pairs previewed in their faces, motion level, ornament
- [x] Sections: dnd-kit reorder (pointer + keyboard) + feature toggles; Gallery: multi-upload, sortable grid, alt text, 30 max; Story/Gifts/People lists with keyboard reordering
- [x] Publish: slug rules (3–60, a-z0-9-, reserved list) + live availability → `publishFn` (draft → published config) → share link, QR (uqr SVG, downloadable), WhatsApp, copy; `/i/$slug` public route (Phase 6 extends it)
- [x] `pnpm db:local`: PGlite behind a Postgres socket (migrated + seeded) for end-to-end testing without Neon
- Acceptance:
  - [x] Preview updates < 300 ms without remounting WebGL: 250 ms measured in the iframe; the particles canvas is the same element after the edit
  - [x] 6 MB JPEG → ≤ 800 KB WebP: 6.05 MB 4000×3000 JPEG → 575 KB WebP 2400×1800
  - [x] Reload restores the draft (headline + gallery verified after reload)
  - [x] Publish makes `/i/<slug>` live (200, published headline, music "Playing" after the cover tap; unknown slug 404)
- Notes / open items:
  - **Music library is infrastructure + 2 generated dev placeholders.** Real CC BY / Pixabay tracks must be added with `pnpm music:add` from a machine that can reach the sources (incompetech.com was unreachable from the build machine); placeholders are hidden in production
  - R2 is wired but untested against a real bucket (no credentials yet); `docs/STORAGE.md` lists the CORS rule the browser PUT needs
  - TanStack devtools console piping is disabled (`vite.config.ts`): it echoed preview logs into a feedback loop that starved the dev server
  - iPhone behaviour of the SoundCloud widget (second tap) still needs a real-device check

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
