# Credits & licensing log

Record here every concrete idea or asset adapted from an external source,
with its license. Code is never pasted from other projects; ideas are
re-implemented inside our block system.

## Component libraries

| Source                               | License              | Use                                                                                                                                                                                                                                                                                          |
| ------------------------------------ | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [shadcn/ui](https://ui.shadcn.com)   | MIT                  | UI primitives in `src/components/ui`                                                                                                                                                                                                                                                         |
| [ReactBits](https://reactbits.dev)   | MIT + Commons Clause | Animation components in `src/components/reactbits`. Used inside the product only; never redistributed or exported.                                                                                                                                                                           |
| [Fontsource](https://fontsource.org) | OFL / per-font       | Self-hosted fonts: Geist, Playfair Display (Phase 0); Inter, Cormorant Garamond, Lora, DM Sans, Fraunces, Cinzel, EB Garamond, Great Vibes, Raleway, Baloo 2, Nunito, Bricolage Grotesque, Manrope, Bebas Neue, Montserrat, Josefin Sans, Quicksand, Space Grotesk, Dancing Script (Phase 2) |

## Design references (ideas only)

| Source     | License | What we borrowed                                                                                                                      |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| _none yet_ |         | Phase 2 blocks and the three templates were composed from scratch in the block system; no external template was consulted or adapted. |

## Music library

| Track                                                                                                                                                                                                                                                                  | Artist | License | Source URL |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------- | ---------- |
| _Library is managed with `pnpm music:add`; every track's license and credit line is stored in `src/lib/music-library.json` and shown on invitations that use it. Only generated dev placeholders exist so far (`sketch-calm`, `sketch-bright`, hidden in production)._ |        |         |            |

## Music sources (Phase 4 decision)

Research: `reports/Background music catalogs for invitations.md` (2026-10-20).

- **Festly library** (R2): curated CC BY / Pixabay-licensed tracks; credit line shown in the invitation footer.
- **Host uploads** (R2): host confirms rights (`rightsConfirmedAt` stored with the source).
- **SoundCloud**: reference only (permalink, track id, title, artist via keyless oEmbed); played in SoundCloud's own visible widget with credit and backlink, per SoundCloud's terms.
- Ruled out by terms: Spotify (Widget Terms forbid commercial use), YouTube (no background players), Apple Music, Deezer, Jamendo free API.

## Maps

| Source                                                                          | License / terms                                                | Use                                                |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------- |
| [OpenStreetMap](https://www.openstreetmap.org/copyright)                        | ODbL; Nominatim usage policy (1 req/s, identifying User-Agent) | Default geocoder (`src/server/geo`), Leaflet tiles |
| [Leaflet](https://leafletjs.com), [react-leaflet](https://react-leaflet.js.org) | BSD-2 / Hippocratic                                            | `leaflet` display adapter                          |
| Google Maps Embed / JS, Mapbox GL, Radar                                        | Provider terms; keys required (except the keyless embed)       | Optional display adapters (rule 11)                |
