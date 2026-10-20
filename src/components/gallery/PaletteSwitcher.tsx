import { Check } from "lucide-react"
import type { KeyboardEvent } from "react"
import { cn } from "@/lib/utils"
import { PALETTES, getPalette } from "@/templates/_shared/theme/palettes"
import { PaletteSwatch } from "./PaletteDots"

type PaletteSwitcherProps = {
  value: string
  /** The template's own palette, listed first and marked as default. */
  defaultId: string
  onChange: (paletteId: string) => void
}

/**
 * Radio group of palette swatches (roving focus: arrow keys move and
 * select, like native radios). The template's default comes first.
 */
export function PaletteSwitcher({
  value,
  defaultId,
  onChange,
}: PaletteSwitcherProps) {
  const ids = [
    defaultId,
    ...PALETTES.map((p) => p.id).filter((id) => id !== defaultId),
  ]
  const current = getPalette(value)

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[
      event.key
    ]
    if (!delta) return
    event.preventDefault()
    const next = ids[(ids.indexOf(value) + delta + ids.length) % ids.length]
    onChange(next)
    event.currentTarget.parentElement
      ?.querySelector<HTMLButtonElement>(`[data-palette="${next}"]`)
      ?.focus()
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p id="palette-label" className="label">
          Palette
        </p>
        <p className="text-sm text-cream" aria-live="polite">
          {current.name}
          {current.id === defaultId && (
            <span className="text-sand"> · default</span>
          )}
        </p>
      </div>
      <div
        role="radiogroup"
        aria-labelledby="palette-label"
        className="mt-4 grid grid-cols-7 gap-2.5 sm:grid-cols-10 lg:grid-cols-7"
      >
        {ids.map((id) => {
          const palette = getPalette(id)
          const selected = id === value
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={palette.name}
              title={palette.name}
              data-palette={id}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(id)}
              onKeyDown={onKeyDown}
              className={cn(
                "relative grid place-items-center rounded-full p-0.5 transition-transform duration-200 hover:scale-110 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink focus-visible:outline-none",
                selected ? "ring-2 ring-gold" : "ring-1 ring-gold/15"
              )}
            >
              <PaletteSwatch palette={palette} className="size-8" />
              {selected && (
                <Check
                  aria-hidden="true"
                  className="absolute size-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
