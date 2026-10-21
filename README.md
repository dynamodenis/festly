# Festly

Configurable invitation websites: pick one of ~50 templates, edit it live,
publish to `/i/<slug>` with RSVP, wishes, countdown, map, gallery and music.

Built with TanStack Start, React 19, Tailwind v4, shadcn/ui, ReactBits, Zod
and Drizzle. See `docs/ARCHITECTURE.md` and `TODO.md` for the phase plan.

## Getting started

```bash
pnpm install
cp .env.example .env        # paste your Neon pooled DATABASE_URL
pnpm db:migrate             # create tables
pnpm db:seed                # templates + one sample invitation
pnpm dev                    # http://localhost:3000
```

Routes available now: `/` and `/dev/smoke` (ReactBits SSR smoke test; hidden
in production builds unless `VITE_ENABLE_DEV_ROUTES=true`).

## Scripts

| Script                              | What it does                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `pnpm dev`                          | Vite dev server on port 3000                                                                                             |
| `pnpm build` / `pnpm start`         | Production build to `dist/`, then serve it with `scripts/serve-dist.mjs` (stop-gap until the Phase 8 deployment adapter) |
| `pnpm typecheck`                    | `tsc --noEmit`                                                                                                           |
| `pnpm lint` / `pnpm lint:fix`       | ESLint (TanStack config + react-hooks + jsx-a11y)                                                                        |
| `pnpm format` / `pnpm format:check` | Prettier with the Tailwind plugin                                                                                        |
| `pnpm test` / `pnpm test:watch`     | Vitest                                                                                                                   |
| `pnpm db:generate`                  | Write a new SQL migration in `drizzle/` from `src/server/db/schema.ts`                                                   |
| `pnpm db:migrate` / `pnpm db:seed`  | Apply migrations / run the idempotent seed against `DATABASE_URL`                                                        |
| `pnpm db:studio` / `pnpm db:check`  | Browse the database / verify migration history                                                                           |
| `pnpm db:local`                     | In-memory Postgres (PGlite, migrated + seeded) on `127.0.0.1:55433` for local testing without Neon                       |
| `pnpm music:add <file> …`           | Add a curated library track (uploads to storage, records license + credit); `music:list`, `music:placeholders`           |
| `pnpm thumbs`                       | Regenerate `public/thumbs/*.webp` from `/preview` (needs `pnpm dev` running; `--url`, `--only <id>`)                     |
| `pnpm smoke:check [url]`            | Opens a page in the system Chrome via playwright-core, waits for hydration, fails on console errors/warnings             |

## Adding components

```bash
pnpm dlx shadcn@latest add <ui-component>
pnpm dlx shadcn@latest add @react-bits/<Name>-TS-TW   # then move into src/components/reactbits
```

The ReactBits catalog is in `docs/REACTBITS_CATALOG.md`.
