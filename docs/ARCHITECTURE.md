# Architecture (Phase 4 snapshot)

Festly is a single TanStack Start app that serves the marketing site, the
template gallery, the editor, the owner dashboard and every published
invitation. One rendering engine draws ~50 templates from a shared,
Zod-validated `InvitationConfig`.

## Stack

| Layer      | Choice                                                 | Notes                                                                                                                                       |
| ---------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework  | TanStack Start 1.169.x (React 19, Vite 8, Nitro)       | File-based routing under `src/routes`, `createServerFn` for server work. Installed version exposes `.validator()` (no `.inputValidator()`). |
| UI         | shadcn/ui (radix-nova preset) + Tailwind v4            | Components are owned source in `src/components/ui`.                                                                                         |
| Effects    | ReactBits via the `@react-bits` shadcn registry        | Fetched, never hand-written. Lives in `src/components/reactbits`, wrapped by `src/templates/_shared/effects`.                               |
| Validation | Zod 4                                                  | Shared between forms, server functions and DB JSONB typing.                                                                                 |
| Data       | Drizzle ORM + Neon Postgres (node-postgres, pooled)    | Schema in `src/server/db/schema.ts`, migrations in `drizzle/`, client `getDb()` in `src/server/db/client.server.ts`.                        |
| Tests      | Vitest + Testing Library (unit), Playwright (Phase 3+) | `vitest.config.ts` is separate from `vite.config.ts`.                                                                                       |

## Folder map

```
src/
  routes/                 file routes; /dev/* is a guarded playground
  components/ui/          shadcn/ui (owned)
  components/reactbits/   ReactBits (registry-owned, do not edit)
  templates/
    _shared/blocks/       CoverGate, Hero, Hosts, Countdown, EventDetails, MapSection, Gallery,
                          StoryTimeline, RsvpForm, Wishes, GiftEnvelope, AddToCalendar,
                          MusicPlayer, Closing/Footer, Divider, Sections (ordered renderer)
    _shared/effects/      BackgroundFx / TitleFx / GalleryFx / Reveal (lazy + ClientOnly wrappers)
    _shared/theme/        palettes (20), fonts (12 pairs) + fonts.css, contrast, motion, ThemeScope
    _shared/schema/       InvitationConfigBase + MediaRef (Phase 1)
    _shared/decor/        Flourishes, Monogram, Seal, ConfettiField, StarField (seeded SVG, no JS)
    _shared/context.tsx   InvitationProvider / useInvitation (config, mode, motion, ornament, actions, opened)
    _shared/README.md     block contract, tones, ornaments, motion matrix, new-template checklist
    registry.ts           sync TemplateMeta list + lazy loaders (id → import())
    resolve-config.ts     safeParse → merge defaults → defaults (never throws)
    TemplateRenderer.tsx  lazy view per template id, Suspense + skeleton; TemplateView for SSR tests
    <category>/<id>/      meta.ts, schema.ts, defaults.ts, index.tsx → defineTemplate({ meta, schema, defaults, Component })
  server/{db,auth,storage,geo,rate-limit}/   server-only modules (*.server.ts)
  lib/                    isomorphic helpers (maps display adapters land here)
  hooks/                  React hooks (SSR-safe)
  env.server.ts           Zod-validated process.env (server only)
  env.public.ts           Zod-validated VITE_* (public; isomorphic)
docs/                     architecture, credits, catalog, build prompt
scripts/                  serve-dist.mjs (Node host for dist/), smoke-check.mjs (hydration check)
```

## Rules that shape every file

- **Templates are compositions.** A template exports `{ meta, schema, defaults, Component }` and receives only `config` and `mode`. Variation comes from layout recipe, design tokens and effect choices, not from new infrastructure.
- **SSR first.** No `window`, `document`, `canvas` or `Audio` during render. WebGL/GSAP effects are `React.lazy` imports rendered inside `<ClientOnly fallback>` with a static gradient or plain-text fallback. `usePrefersReducedMotion()` and `useHydrated()` gate client-only values.
- **Motion is opt-down.** `theme.motionLevel` (`full | reduced | none`) and `prefers-reduced-motion` both disable heavy effects.
- **Uploads bypass server functions.** Presigned PUT URLs; server functions only mint URLs and record metadata.
- **Provider-agnostic maps.** Config stores lat/lng/address/placeName only. Display and geocode adapters are selected by env and lazy-imported.
- **Licensing.** ReactBits is MIT + Commons Clause: use inside the product, never redistribute. Design ideas only from MIT/ISC/Apache/CC BY sources, logged in `CREDITS.md`.

## Rendering pipeline (Phase 2)

```
TemplateRenderer(templateId, config, mode, actions?)
  └─ lazy(loadTemplate(id)) ── Suspense(TemplateRendererSkeleton)
       └─ TemplateView: resolveConfig(module, config)
            └─ InvitationProvider (config, mode, effective motion, palette, opened/open, actions)
                 └─ ThemeScope (inline --inv-* vars; Tailwind inv-* utilities read them)
                      └─ module.Component({ config, mode })
                           ├─ CoverGate  (inline on server → fixed gate after hydration → tap opens + starts music)
                           ├─ BackgroundFx (static gradient always; WebGL canvas lazy, only at motion "full")
                           ├─ Hero + TitleFx (plain heading is the SSR fallback)
                           └─ <Sections config sections={{ hosts, event, ... }} />  (follows sectionsOrder + features)
```

Motion: `effectiveMotion(theme.motionLevel, prefersReducedMotion)` → `full | reduced | none`.
OS reduce-motion always yields `none`; `reduced` keeps light text effects but no canvas.

## Routes (Phase 3)

| Route                        | What                                                                    |
| ---------------------------- | ----------------------------------------------------------------------- |
| `/templates`                 | Gallery; `?category=&q=` (Zod-validated, defaults stripped)             |
| `/templates/$category/$slug` | Detail + live device preview; `?device=&palette=`                       |
| `/preview/$category/$slug`   | Bare template render (iframe, full-screen link, `pnpm thumbs`); noindex |
| `/editor/$invitationId`      | Phase 4 editor; currently renders the owner's draft                     |
| `/dev/templates/$`           | Developer playground (404 in production unless enabled)                 |

Server functions live in `src/server/<area>/<area>.functions.ts` (safe to import
from routes; handlers become RPC stubs on the client) and call pure
`*.server.ts` services that take a Drizzle db, so tests run them on PGlite.
Every handler resolves the user through `requireUserId()` (dev user until Phase 5).

## Phase 4 additions

| Area        | Where                                                                                 | Notes                                                                          |
| ----------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Storage     | `src/server/storage`                                                                  | `StorageDriver`: R2 (aws4fetch presign) or local dev driver; `docs/STORAGE.md` |
| Uploads     | `src/server/media`, `src/components/editor/useUploader.ts`, `src/lib/image-resize.ts` | sign → PUT → confirm; never bytes through server fns                           |
| Music       | `src/templates/_shared/blocks/music`, `src/server/music`, `src/lib/music-library.*`   | controller in context starts audio inside the cover tap                        |
| Maps        | `src/lib/maps` (display), `src/server/geo` (geocode)                                  | rule 11 registry, contract-tested geocoders, `/dev/maps`                       |
| Editor      | `src/components/editor`, `src/routes/editor/$invitationId.tsx`                        | tabs + `fieldsUi`, autosave with conflict detection, postMessage preview       |
| Public page | `src/routes/i/$slug.tsx`                                                              | published config only (Phase 6 adds OG, RSVP, analytics)                       |
| Local DB    | `scripts/dev-db.ts` (`pnpm db:local`)                                                 | PGlite over a Postgres socket for e2e without Neon                             |

## Request flow (target state)

```
/templates ──meta only──▶ /templates/$id (preview iframe) ──▶ "Use" ──▶ /editor/$invitationId
                                                                   │ autosave draftConfig (server fn)
                                                                   ▼ publish → publishedConfig + slug
/i/$slug  SSR loader → TemplateRenderer(config, mode="public") → CoverGate → sections
          head() → OG tags → /og/$slug.png ; /ics/$slug ; submitRsvp / submitWish server fns
```
