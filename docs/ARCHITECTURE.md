# Architecture (Phase 0 snapshot)

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
| Data       | Drizzle ORM (Phase 1, provider TBD)                    |                                                                                                                                             |
| Tests      | Vitest + Testing Library (unit), Playwright (Phase 3+) | `vitest.config.ts` is separate from `vite.config.ts`.                                                                                       |

## Folder map

```
src/
  routes/                 file routes; /dev/* is a guarded playground
  components/ui/          shadcn/ui (owned)
  components/reactbits/   ReactBits (registry-owned, do not edit)
  templates/
    _shared/blocks/       CoverGate, Hero, Countdown, Map, Gallery, Rsvp, ... (Phase 2)
    _shared/effects/      BackgroundFx / TitleFx / GalleryFx wrappers (Phase 2)
    _shared/theme/        palettes, font pairs, ThemeScope (Phase 2)
    _shared/schema/       InvitationConfigBase + MediaRef (Phase 1)
    <category>/<id>/      one folder per template: { meta, schema, defaults, Component }
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

## Request flow (target state)

```
/templates ──meta only──▶ /templates/$id (preview iframe) ──▶ "Use" ──▶ /editor/$invitationId
                                                                   │ autosave draftConfig (server fn)
                                                                   ▼ publish → publishedConfig + slug
/i/$slug  SSR loader → TemplateRenderer(config, mode="public") → CoverGate → sections
          head() → OG tags → /og/$slug.png ; /ics/$slug ; submitRsvp / submitWish server fns
```
