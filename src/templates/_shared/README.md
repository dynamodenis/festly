# Template building kit

Everything a template composes lives here. A template's `index.tsx` should be
mostly a `<Sections>` map of these pieces (target: under 200 lines).

## Layers

| Folder     | What                                                                                    | Rule                                                                            |
| ---------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `schema/`  | `InvitationConfigBase` (Zod) + inferred types                                           | Templates extend it with `.extend({...})`; never fork it.                       |
| `theme/`   | palettes, font pairs, contrast, motion, `ThemeScope`                                    | Colors come from `--inv-*` tokens only (`bg-inv-bg`, `text-inv-primary`, …).    |
| `blocks/`  | sections (Hero, Hosts, Countdown, …) and primitives (`Section`, `InvButton`, `Divider`) | Pure and SSR-safe. Read data from `useInvitation()`, never fetch.               |
| `effects/` | `BackgroundFx`, `TitleFx`, `GalleryFx`, `Reveal` around ReactBits                       | Static fallback always renders; the ReactBits component is lazy + `ClientOnly`. |
| `decor/`   | `Flourishes`, `Monogram`, `Seal`, `ConfettiField`, `StarField`                          | Pure SVG/CSS, seeded (never `Math.random`), `aria-hidden`, works with JS off.   |

## Block contract

Every section block accepts `BlockProps`:

```ts
type BlockProps = {
  eyebrow?: string // small caps line above the title
  title?: string
  tone?: "plain" | "surface" | "tint" // band background
  className?: string
}
```

plus its own `variant` (2–4 layouts each). Alternate `tone="tint"` bands down
the page for rhythm; tints are AA-checked (`palettes.test.ts`).

`CoverGate` and `Closing` also take `crest` (content above the title, such as
a monogram or seal) and `decor` (an ornament layer behind the text).

## Ornaments

`<Divider />` with no `kind` draws the invitation's ornament: `theme.ornament`
when it is one of `leaf | line | dots | wave | star | diamond`, otherwise the
template's `meta.ornament`. Pass `kind` only to force a specific one.

## Motion

`effectiveMotion(theme.motionLevel, prefersReducedMotion)` gives
`full | reduced | none`, available as `useInvitation().motion`.

| Level     | WebGL backgrounds | TitleFx            | Reveal / CSS float, spin | CSS twinkle, rise |
| --------- | ----------------- | ------------------ | ------------------------ | ----------------- |
| `full`    | yes               | split, blur, shiny | yes                      | yes               |
| `reduced` | no                | blur, shiny        | no                       | yes               |
| `none`    | no                | plain text         | no                       | no                |

CSS ornaments opt in with `inv-anim-float | inv-anim-twinkle | inv-anim-spin |
inv-anim-rise`; `ThemeScope` writes `data-motion` and `styles.css` switches
them off. OS reduce-motion always wins.

## Utilities (styles.css)

- `inv-foil`: primary → accent gradient clipped to text (headlines, names).
- `inv-frame`: double hairline frame inside a positioned parent (`--inv-frame-inset`).
- `inv-grain`: paper texture overlay; enable per template with `meta.grain`.
- `inv-tone-tint` / `inv-tone-surface`: band backgrounds (use `tone` instead).

## Checklist for a new template

1. `meta.ts`: id `<category>/<slug>`, default palette + font pair, `ornament`, `effects`.
2. `schema.ts`: `InvitationConfigBase` or an `.extend()` for template-only fields.
3. `defaults.ts`: `schema.parse({...})` so a bad default fails at import.
4. `index.tsx`: `CoverGate` → hero wrapper (`BackgroundFx` + decor + `Hero`) → `<Sections>` → `MusicPlayer`.
5. Register in `registry.ts` and the seed; `registry.test.ts` and the SSR test pick it up automatically.
6. Check `/dev/templates/<id>` at motion full / none, mobile and desktop.
