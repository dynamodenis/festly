import { CheckCircle2, TriangleAlert } from "lucide-react"
import { PaletteSwitcher } from "@/components/gallery/PaletteSwitcher"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  CoverReveal,
  Envelope,
  EnvelopeLiner,
  EnvelopeSeal,
  MotionLevel,
} from "@/templates/_shared/schema"
import { contrastRatio } from "@/templates/_shared/theme/contrast"
import { FONT_PAIRS } from "@/templates/_shared/theme/fonts"
import { getPalette, resolvePalette } from "@/templates/_shared/theme/palettes"
import { themeVars } from "@/templates/_shared/theme/ThemeScope"
import { ORNAMENTS } from "@/templates/types"
import { useEditor } from "../EditorContext"
import { Group } from "../fields"

const TOKENS = [
  "background",
  "foreground",
  "primary",
  "secondary",
  "accent",
] as const
const MOTION_COPY: Record<MotionLevel, string> = {
  full: "Animated backgrounds, letter effects and scroll reveals",
  reduced: "Gentle fades only, no animated backgrounds",
  none: "Completely still",
}
const REVEAL_COPY: Record<CoverReveal, { label: string; help: string }> = {
  envelope: {
    label: "Envelope",
    help: "Guests break the seal, the flap opens and the letter slides out",
  },
  lift: {
    label: "Slide up",
    help: "The cover lifts away to reveal the page",
  },
}
const LINER_LABEL: Record<EnvelopeLiner, string> = {
  stripes: "Stripes",
  dots: "Dots",
  floral: "Floral",
  confetti: "Confetti",
  plain: "Plain",
}
const SEAL_COPY: Record<EnvelopeSeal, { label: string; help: string }> = {
  sticker: { label: "Sticker", help: "A paper seal with a fine ring" },
  wax: { label: "Wax", help: "A glossy wax seal with the crest pressed in" },
}

function ContrastCheck({
  fg,
  bg,
  label,
  min,
}: {
  fg: string
  bg: string
  label: string
  min: number
}) {
  const ratio = contrastRatio(fg, bg)
  const ok = ratio !== null && ratio >= min
  return (
    <li className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2">
        {ok ? (
          <CheckCircle2
            className="size-4 text-emerald-400"
            aria-hidden="true"
          />
        ) : (
          <TriangleAlert className="size-4 text-amber-400" aria-hidden="true" />
        )}
        {label}
      </span>
      <span
        className={cn(
          "nums tabular-nums",
          ok ? "text-muted-foreground" : "text-amber-300"
        )}
      >
        {ratio === null ? "?" : `${ratio.toFixed(1)}:1`}{" "}
        <span className="sr-only">{ok ? "passes" : "fails"}</span>
        <span aria-hidden="true"> / {min}:1</span>
      </span>
    </li>
  )
}

export function DesignTab() {
  const { config, set, module } = useEditor()
  const theme = config.theme
  const palette = resolvePalette(theme)
  // Drafts load from the DB unparsed, so ones saved before this option
  // existed have no value; the page opens them as an envelope (the schema
  // default), so show that.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const coverReveal = theme.coverReveal ?? "envelope"
  // Same for the envelope; parsing fills whatever is missing.
  const envelope = Envelope.parse({ ...theme.envelope })
  // Swatches render with the invitation's own tokens and envelope CSS.
  const swatchScope = {
    "data-mode": palette.mode,
    style: themeVars(
      palette,
      theme.fontPairId,
      module.meta.radius ?? "0.75rem"
    ),
  }

  const toggleCustom = (on: boolean) => {
    if (!on) return set(["theme", "custom"], undefined)
    const base = getPalette(theme.paletteId)
    set(
      ["theme", "custom"],
      Object.fromEntries(TOKENS.map((t) => [t, base[t]]))
    )
  }

  return (
    <>
      <Group title="Colours">
        <PaletteSwitcher
          value={theme.paletteId}
          defaultId={module.meta.defaultPaletteId}
          onChange={(id) => {
            set(["theme", "paletteId"], id)
            set(["theme", "custom"], undefined)
          }}
        />
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card/50 px-4 py-3">
          <label htmlFor="custom-colours" className="text-sm font-medium">
            Custom colours
          </label>
          <Switch
            id="custom-colours"
            checked={!!theme.custom}
            onCheckedChange={toggleCustom}
          />
        </div>
        {theme.custom && (
          <div className="grid gap-3 sm:grid-cols-2">
            {TOKENS.map((token) => {
              const value = theme.custom?.[token] ?? ""
              const id = `colour-${token}`
              return (
                <div key={token} className="flex items-center gap-3">
                  <input
                    type="color"
                    aria-label={`${token} colour picker`}
                    value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
                    onChange={(e) =>
                      set(["theme", "custom", token], e.target.value)
                    }
                    className="size-9 shrink-0 cursor-pointer rounded-lg border border-input bg-transparent"
                  />
                  <div className="flex flex-1 flex-col gap-1">
                    <label
                      htmlFor={id}
                      className="text-xs text-muted-foreground capitalize"
                    >
                      {token}
                    </label>
                    <Input
                      id={id}
                      value={value}
                      onChange={(e) =>
                        set(["theme", "custom", token], e.target.value)
                      }
                      className="h-8 font-mono text-xs"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div className="rounded-xl border border-border p-4">
          <p className="mb-3 text-sm font-medium">Readability (WCAG AA)</p>
          <ul className="flex flex-col gap-2">
            <ContrastCheck
              fg={palette.foreground}
              bg={palette.background}
              label="Body text"
              min={4.5}
            />
            <ContrastCheck
              fg={palette.primary}
              bg={palette.background}
              label="Accent headings"
              min={3}
            />
            <ContrastCheck
              fg={palette.foreground}
              bg={palette.secondary}
              label="Text on tinted bands"
              min={4.5}
            />
          </ul>
        </div>
      </Group>

      <Group title="Fonts">
        <div
          role="radiogroup"
          aria-label="Font pair"
          className="grid gap-2 sm:grid-cols-2"
        >
          {FONT_PAIRS.map((pair) => {
            const selected = pair.id === theme.fontPairId
            return (
              <button
                key={pair.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => set(["theme", "fontPairId"], pair.id)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <span
                  className="text-2xl leading-tight"
                  style={{ fontFamily: pair.display }}
                >
                  {config.hosts[0]?.shortName ?? "Celebrate"}
                </span>
                <span
                  className="text-sm text-muted-foreground"
                  style={{ fontFamily: pair.body }}
                >
                  {pair.name} · {pair.vibe}
                </span>
              </button>
            )
          })}
        </div>
      </Group>

      <Group title="Motion">
        <div
          role="radiogroup"
          aria-label="Motion level"
          className="grid gap-2 sm:grid-cols-3"
        >
          {MotionLevel.options.map((level) => (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={theme.motionLevel === level}
              onClick={() => set(["theme", "motionLevel"], level)}
              className={cn(
                "rounded-xl border px-4 py-3 text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                theme.motionLevel === level
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className="block text-sm font-medium capitalize">
                {level}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {MOTION_COPY[level]}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Guests who turn on “reduce motion” on their phone always get a still
          page.
        </p>
      </Group>

      <Group title="Opening">
        <div
          role="radiogroup"
          aria-label="How the invitation opens"
          className="grid gap-2 sm:grid-cols-2"
        >
          {CoverReveal.options.map((reveal) => (
            <button
              key={reveal}
              type="button"
              role="radio"
              aria-checked={coverReveal === reveal}
              onClick={() => set(["theme", "coverReveal"], reveal)}
              className={cn(
                "rounded-xl border px-4 py-3 text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                coverReveal === reveal
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className="block text-sm font-medium">
                {REVEAL_COPY[reveal].label}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {REVEAL_COPY[reveal].help}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Tap the button in the preview to try it.
        </p>

        {coverReveal === "envelope" && (
          <div {...swatchScope} className="inv-root flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p
                id="liner-label"
                className="text-sm font-medium text-foreground"
              >
                Lining
              </p>
              <p className="-mt-1 text-xs text-muted-foreground">
                The paper inside the envelope, seen as the flap opens. The
                preview lifts the flap when you pick one.
              </p>
              <div
                role="radiogroup"
                aria-labelledby="liner-label"
                className="grid grid-cols-3 gap-2 sm:grid-cols-5"
              >
                {EnvelopeLiner.options.map((liner) => (
                  <button
                    key={liner}
                    type="button"
                    role="radio"
                    aria-checked={envelope.liner === liner}
                    onClick={() => set(["theme", "envelope", "liner"], liner)}
                    className={cn(
                      "flex flex-col gap-1.5 rounded-xl border p-1.5 text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                      envelope.liner === liner
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="inv-env block" data-liner={liner}>
                      <span className="inv-env-liner relative block h-12 overflow-hidden rounded-lg" />
                    </span>
                    <span className="px-1 pb-0.5 text-xs text-foreground">
                      {LINER_LABEL[liner]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p
                id="seal-label"
                className="text-sm font-medium text-foreground"
              >
                Seal
              </p>
              <div
                role="radiogroup"
                aria-labelledby="seal-label"
                className="grid gap-2 sm:grid-cols-2"
              >
                {EnvelopeSeal.options.map((seal) => (
                  <button
                    key={seal}
                    type="button"
                    role="radio"
                    aria-checked={envelope.seal === seal}
                    onClick={() => set(["theme", "envelope", "seal"], seal)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                      envelope.seal === seal
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="inv-env shrink-0" data-seal={seal}>
                      <span className="inv-env-seal relative block size-9 rounded-full bg-inv-bg shadow-[0_4px_10px_-4px_rgb(0_0_0/0.45)] ring-1 ring-inv-primary/40" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-foreground">
                        {SEAL_COPY[seal].label}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {SEAL_COPY[seal].help}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card/50 px-4 py-3">
              <div>
                <label
                  htmlFor="envelope-stamp"
                  className="text-sm font-medium text-foreground"
                >
                  Postage stamp
                </label>
                <p className="text-xs text-muted-foreground">
                  The event date on a stamp in the corner
                </p>
              </div>
              <Switch
                id="envelope-stamp"
                checked={envelope.stamp}
                onCheckedChange={(on) =>
                  set(["theme", "envelope", "stamp"], on)
                }
              />
            </div>
          </div>
        )}
      </Group>

      <Group title="Ornament">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ornament" className="text-sm font-medium">
            Divider style
          </label>
          <select
            id="ornament"
            value={theme.ornament ?? ""}
            onChange={(e) =>
              set(["theme", "ornament"], e.target.value || undefined)
            }
            className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm"
          >
            <option value="">
              Template default ({module.meta.ornament ?? "line"})
            </option>
            {ORNAMENTS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </Group>
    </>
  )
}
