# Festly build prompt (authoritative phase spec)

Saved 2026-10-14 from the user's research brief so later sessions can read the
exact phase spec from disk. Workflow: the user says **"Run Phase N"**; do only
that phase, then stop with (a) files created/changed, (b) how to verify each
acceptance criterion, (c) open questions. Phase 7 runs in batches.

## Global rules

1. **Stack:** TanStack Start 1.x + React + TypeScript (strict) + TanStack Router (file-based) + TanStack Query + Tailwind v4 + shadcn/ui + Zod + Drizzle. pnpm. Read the `SKILL.md` files under `node_modules/@tanstack/*/skills` and match the installed APIs (installed 1.169.x uses `createServerFn().validator()`).
2. **ReactBits:** always fetch through the shadcn MCP/CLI from `@react-bits` (`@react-bits/<Name>-TS-TW`). Never hand-write look-alikes. Install peer deps only as needed. Keep fetched files in `src/components/reactbits/`, wrap rather than edit. Catalog: `docs/REACTBITS_CATALOG.md`.
3. **ReactBits license** is MIT + Commons Clause: use inside the product; never sell/redistribute the source; never build a "download template source" feature.
4. **SSR safety:** no `window`/`document`/`localStorage`/`canvas`/`Audio` in render or at module top level. WebGL/GSAP/canvas effects: `React.lazy` + `<ClientOnly fallback>` with a static gradient or plain-text fallback. Use `useHydrated()`, `createClientOnlyFn`, `*.client.tsx` / `*.server.ts` suffixes (note: `*.client.*` cannot be imported by isomorphic route code; public env lives in `env.public.ts`). Secrets only in `*.server.ts` or server-fn handlers.
5. **Template interface:** every template exports exactly `{ meta, schema, defaults, Component }`; receives only `config` and `mode` (`"preview" | "public"`); never fetches data itself.
6. **Design sources:** ideas only from MIT/ISC/Apache-2.0/CC BY projects (dewanakl/undangan, raflyazwar/undangan-pernikahan, sakeenah-wedding/template, juhonamnam/wedding-invitation, kbichave/wedding-invite, HTML5 UP). Re-design in our block system; never paste. Never copy from no-license, GPL or paid sources. Record adaptations in `docs/CREDITS.md`.
7. **Ask before irreversible choices:** DB provider, auth provider, object storage, payments, deployment target, destructive migrations. Offer 2–3 options with trade-offs and a recommendation.
8. **Accessibility & motion:** respect `prefers-reduced-motion` and per-invitation `theme.motionLevel` (`full | reduced | none`); in reduced/none skip WebGL and use the static fallback. WCAG AA body contrast; editor warns on failing palettes.
9. **Code quality:** ESLint + Prettier clean, no `any` in app code, Zod at every server boundary, small components, colocated tests. Never end a phase with a non-building app.
10. **Env:** Zod-validated `src/env.server.ts` (server) and `src/env.public.ts` (VITE_* only). `.env.example` provided. Never commit secrets.
11. **Map providers are pluggable.** `MapDisplayProvider` (client; `Map` component + `directionsUrl`) in `src/lib/maps/` and `GeocodeProvider` (server) in `src/server/geo/`. Adapters: google-embed (default, free iframe), google-js (`@vis.gl/react-google-maps`), mapbox (`mapbox-gl`), radar (`radar-sdk-js`), leaflet (`react-leaflet` + OSM); geocoders: nominatim (default), google, mapbox, radar. Selected via `MAP_DISPLAY_PROVIDER` / `GEOCODE_PROVIDER` env with a registry that lazy-imports only the chosen adapter. Config stores only lat/lng/address/placeName, never provider-specific embed URLs or IDs. Every display adapter is SSR-safe (iframe, or ClientOnly + lazy with an address-card fallback), accepts a light/dark hint from the palette, exposes Google/Waze/Apple directions links. Dev page `/dev/maps` renders one venue with every adapter; a Vitest contract test runs each geocoder against mocked HTTP fixtures and asserts one output shape.

## Phase 0 — Project setup & smoke test (done 2026-10-14)

Scaffold Start + shadcn; add shadcn components; `@react-bits` registry; install BlurText + Aurora; `/dev/smoke`; ESLint/Prettier/Vitest; folder structure; env modules; `docs/ARCHITECTURE.md`.
Acceptance: `pnpm dev` serves `/` and `/dev/smoke` with SSR text + fallback and no hydration warnings; Aurora animates after hydration and the page is styled without JS; `pnpm typecheck && pnpm lint && pnpm build` pass; ReactBits files came from the registry.

## Phase 1 — Data model & Zod schemas

**STOP FIRST:** ask Postgres on Neon (recommended) vs Cloudflare D1/Turso vs Supabase.

- `src/templates/_shared/schema/base.ts` — `InvitationConfigBase` (Zod):
  `hosts[]` { name, shortName?, role (bride|groom|host|graduate|celebrant|baby|company|other), photo?: MediaRef, parentsLine? } ·
  `event` { type (wedding|birthday|graduation|baby_shower|anniversary|corporate|engagement|khitanan|aqiqah|other), title, subtitle?, subEvents[] { label, start, end?, venueRef? } } ·
  `datetime` { start ISO, end?, timezone IANA } ·
  `venue` { name, address, lat?, lng?, mapEmbedUrl?, directionsUrl?, notes? } (rule 11: prefer lat/lng/address/placeName) ·
  `theme` { paletteId | custom { primary, secondary, accent, background, foreground }, fontPairId, motionLevel, ornament? } ·
  `music` { enabled, source: { kind: "library", trackId } | { kind: "upload", assetKey }, startAtSec?, loop } ·
  `texts` { coverTitle, coverButtonLabel, headline, message, dressCode?, rsvpPrompt, rsvpDeadline?, closing, footerNote? } ·
  `gallery: MediaRef[]` (max 30) · `story[]` { date?, title, body, photo? } ·
  `gifts` { enabled, accounts[] { bank, holder, number }, ewallets[], qrImage?, registryLinks[] { label, url } } ·
  `features` { countdown, rsvp, wishes, gallery, story, gifts, calendar, map, music } · `sectionsOrder: SectionId[]` · `seo` { title?, description?, ogImage? }.
  `MediaRef = { assetKey, url, width?, height?, alt? }`.
- `src/templates/types.ts`: `TemplateMeta { id, name, category, tags[], description, thumbnail, isPremium, supportedEventTypes[], defaultPaletteId, defaultFontPairId, effects { background?, title?, gallery? } }`; `TemplateModule<S> { meta, schema: S, defaults: z.infer<S>, Component: React.FC<{ config: z.infer<S>; mode: "preview"|"public" }> }`.
- Drizzle schema `src/server/db/schema.ts`: users (placeholder for auth lib), invitations (id, ownerId, templateId, slug unique, status draft|published|archived, draftConfig jsonb, publishedConfig jsonb, publishedAt, createdAt, updatedAt), templates_meta (id, category, name, isPremium, sortOrder, enabled), media_assets (id, ownerId, invitationId?, kind image|audio, key, mime, bytes, width?, height?, durationSec?, createdAt), rsvps (id, invitationId, guestName, attending yes|no|maybe, partySize, message?, contact?, createdAt, ipHash, userAgentHash), wishes (id, invitationId, name, message, approved, createdAt, ipHash), page_views (invitationId, day, count; unique (invitationId, day)), geocode_cache (queryHash pk, query, lat, lng, displayName, createdAt), guests (id, invitationId, name, slugToken, group).
- `drizzle.config.ts`, migrations, seed (templates_meta + one sample invitation).
- Acceptance: `pnpm db:generate && pnpm db:migrate && pnpm db:seed` succeed; unit tests: full sample parses, rejects bad dates, bad colors (hex/oklch only), gallery > 30; `z.infer<typeof InvitationConfigBase>` used by DB (`$type<>`) and templates.

## Phase 2 — Template engine + first 3 templates

- Theme: `palettes.ts` (≥16 incl. ivory-gold, sage, dusty-rose, navy-gold, terracotta, midnight, monochrome, corporate-blue), `fonts.ts` (≥10 pairs via Fontsource), `ThemeScope` sets `--inv-primary/-secondary/-accent/-bg/-fg/-font-display/-font-body/-radius` as INLINE style on the template root; Tailwind `@theme` tokens referencing them (`bg-inv-bg`, `text-inv-primary`).
- Blocks (`_shared/blocks`, pure, SSR-safe, 2–3 `variant`s): CoverGate, Hero, Countdown (static on server, ticks after `useHydrated`), EventDetails (subEvents), MapSection (embed iframe lazy + title + referrerpolicy; fallback address card + Google/Waze/Apple links), Gallery (grid + lightbox, optional effect), StoryTimeline, RsvpForm (server fn via context; disabled in preview with toast), Wishes, GiftEnvelope (copy-to-clipboard, QR), AddToCalendar (Google link + `/ics/$slug`), MusicPlayer (single HTMLAudioElement in effect; catches `play()` rejection; "tap to play" chip), Footer.
- Effects (`_shared/effects`): BackgroundFx, TitleFx, GalleryFx with `kind` (aurora|silk|particles|iridescence|waves|none), lazy + ClientOnly + fallback, respect motionLevel + reduced motion. Fetch via MCP: Aurora, Silk, Particles, Iridescence, SplitText, BlurText, ShinyText, TiltedCard, Carousel, CountUp/Counter, AnimatedContent/FadeContent.
- TemplateRenderer (lazy module from `registry.ts`, `safeParse` → merge defaults + log on failure, ThemeScope, Component) + `TemplateRendererSkeleton`. `registry.ts`: id → lazy import + synchronous meta list.
- Templates: `wedding/ivory-garden` (serif, ivory+gold, Silk, SplitText, SVG dividers; cover, hero, couple, event akad+resepsi, story, gallery TiltedCard, map, rsvp, wishes, gifts, closing); `birthday/confetti-pop` (rounded font, bright, Particles confetti, BlurText, `age` extension, countdown, Carousel, map, rsvp); `graduation/cap-and-gown` (navy+gold, Aurora, ShinyText "Class of {year}", school/degree/classOf, milestones, map, rsvp).
- `/dev/templates/$id` with defaults.
- Acceptance: SSR clean; readable without JS; no WebGL in initial chunk; motionLevel "none" removes effects; each template < 200 lines; no duplicated block code.

## Phase 3 — Template gallery & preview

`/templates` (category tabs All/Wedding/Birthday/Graduation/Baby Shower/Anniversary/Corporate/Other, search, cards; meta only). `/templates/$templateId` live render, device toggle via `/preview/$templateId?device=`, palette quick-switcher, "Use this template" (sign-in or dev-user stub → draft row → `/editor/$invitationId`). `pnpm thumbs` (Playwright 390×844 → `public/thumbs/*.webp`).
Acceptance: typed search params (validateSearch + Zod); preview LCP < 2.5 s desktop dev; "Use" creates a DB row.

## Phase 4 — Editor

**STOP FIRST:** confirm storage (R2 recommended; Supabase Storage, S3, UploadThing).
Split pane; tabs Basics/People/Event & Venue/Design/Music/Texts/Sections/Gallery/Story/Gifts/Sharing; live preview (`TemplateRenderer` preview mode, debounced 200 ms) + device iframe via postMessage; form from template schema + `fieldsUi`. Uploads: `createUploadUrl({ kind, mime, bytes })` (auth, mime image/jpeg|png|webp|avif + audio/mpeg|mp4|ogg, ≤ 8 MB images / ≤ 10 MB audio) → presigned PUT; client-side resize (max 2400 px, webp); `confirmUpload({ key })` records media_assets. Never send bytes through server fns. Music library (~12 tracks, licenses in CREDITS) + MP3 upload + start-at slider. Palettes + custom 5 tokens + live WCAG check. Font pairs. Map: `geocode(query)` (cache → Nominatim jsonv2, custom UA with contact email, global 1 req/s, no type-ahead), pasted Google Maps URL parsing, embed iframe (`VITE_GOOGLE_MAPS_EMBED_KEY`), manual lat/lng; rule 11 adapters + `/dev/maps` + contract tests. Sections dnd-kit reorder + toggles. Autosave 1.5 s → `saveDraft` (Zod + ownership + updatedAt conflict). Publish: slug (a-z0-9-, 3–60, unique, reserved list) → `publish({ id, slug })`; share link + QR + WhatsApp.
Acceptance: preview updates < 300 ms without remounting WebGL; 6 MB JPEG → ≤ 800 KB webp; reload restores draft; publish makes `/i/<slug>` live.

## Phase 5 — Auth & dashboard

**STOP FIRST:** Better Auth (recommended; `tanstackStartCookies()` LAST plugin; handler `src/routes/api/auth/$.ts`) vs Clerk vs WorkOS AuthKit.
Email+password, Google OAuth (+ magic link); session server fn; `_authed` layout `beforeLoad`; fn middleware injecting `context.user`. `/dashboard` list (thumb, template, status, slug, 7-day views, RSVP count; edit/preview/duplicate/archive/delete/copy link). Page views per day in `/i/$slug` loader (hashed IP+UA dedupe, skip bots). `/dashboard/$invitationId/responses` (TanStack Table, totals, wishes moderation, CSV via `/api/export/$invitationId.csv` with UTF-8 BOM). Optional guest list + personal links `?to=` + WhatsApp message.
Acceptance: unauthenticated `/editor`, `/dashboard` redirect; cross-user access blocked (tests); CSV opens in Excel/Sheets.

## Phase 6 — Public invitation page

`/i/$slug` SSR loader (404 if missing/archived); `head()` OG/Twitter/theme-color; `/og/$slug.png` (satori + resvg, cached in storage, invalidated on publish). CoverGate ("Dear {to}" sanitized), music starts inside the click handler (handle NotAllowedError), scroll unlock, entrance animations, floating music toggle, countdown, add-to-calendar (Google + `/ics/$slug` with TZ), share (Web Share API + copy + WhatsApp), map + directions. `submitRsvp` / `submitWish`: Zod, honeypot, Turnstile (optional in dev), rate limit (5/min, 30/day per ipHash per invitation via `src/server/rate-limit` interface), length limits, escaping, optimistic UI. Perf: hero width/height + fetchpriority, srcset, lazy gallery, effects after open, < 150 KB gz JS before open (report actual).
Acceptance: correct OG card in WhatsApp/Facebook debugger; 20 rapid RSVP posts get rate-limited; music never starts before tap on iOS Safari/Android Chrome; axe 0 serious violations.

## Phase 7 — Scale to 50 templates

`docs/TEMPLATE_AUTHORING.md` (contract, blocks/variants, tokens, effects, motion, thumbnails, naming, checklist). Generator `pnpm gen:template --id <cat>/<id> --name "..." --category <cat> --base <cat>/<id>` (scaffold index/schema/defaults/meta, register in registry + seed, thumbs). Batches of 5–10 on "Run Phase 7, batch: <category> <range>". Targets:

- WEDDING (10): ivory-garden, midnight-aurora, javanese-heritage, minimal-mono, rustic-barn, boho-terracotta, royal-islamic, beach-sunset, cinema-reel, pastel-petals.
- BIRTHDAY (8): confetti-pop, dino-adventure, princess-castle, neon-night, retro-arcade, golden-milestone, sweet-seventeen, garden-tea-party.
- GRADUATION (6): cap-and-gown, chalkboard, varsity, tech-terminal, starry-future, polaroid-memories.
- BABY SHOWER (6): cloud-nine, little-safari, gender-reveal, twinkle-star, botanical-sage, teddy-picnic.
- ANNIVERSARY (5): golden-years, silver-jubilee, love-letter, then-and-now, vinyl-love-song.
- CORPORATE (6): product-launch, black-tie-gala, conference-grid, holiday-party, team-offsite, webinar-minimal.
- OTHER (9): engagement-sparkle, khitanan-ceria, aqiqah-soft, housewarming-keys, bridal-shower-blush, retirement-sunset, eid-open-house, christmas-dinner, class-reunion.
  Acceptance per batch: authoring checklist; thumbnails; `/templates` categories; Playwright contact sheet in `docs/batches/<batch>.png` shows visual distinctness.

## Phase 8 — Polish & deploy

**STOP FIRST:** Vercel vs Netlify vs Cloudflare Workers (`@tanstack/react-start/server-entry`; check DB driver + sharp/satori) vs Railway/Node.
Perf (code splitting, effects after open + in-viewport + paused when hidden, preconnect, image transforms, cache headers for `/i/$slug` purged on publish). A11y (keyboard paths, focus management, required alt text, `locale` in config with `lang`, RTL-safe). Reduced-motion audit. i18n (en + id), Intl dates with invitation TZ. Tests: Vitest (schemas, slug, rate limiter, ics, geocode cache); Playwright e2e (browse → preview → use → edit → upload (mocked) → publish → open → RSVP → dashboard → CSV); SSR test (renderToString each template, no `window`). Security: CSP, escaping, URL validation (http/https only), signed URLs ≤ 10 min, owner checks, latest Start patch. Deploy config + README.
Acceptance: `pnpm test && pnpm e2e && pnpm build` green; Lighthouse mobile ≥ 90 perf / ≥ 95 a11y on a published wedding invite (report numbers); deployed preview works end-to-end.
