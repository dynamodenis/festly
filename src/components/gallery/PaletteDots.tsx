import { cn } from "@/lib/utils"
import type { Palette } from "@/templates/_shared/theme/palettes"

/** A palette as a row of overlapping dots (background ring, then colors). */
export function PaletteDots({
  palette,
  className,
}: {
  palette: Palette
  className?: string
}) {
  const colors = [
    palette.background,
    palette.primary,
    palette.accent,
    palette.secondary,
  ]
  return (
    <span aria-hidden="true" className={cn("flex -space-x-1.5", className)}>
      {colors.map((color, i) => (
        <span
          key={i}
          className="size-4 rounded-full ring-2 ring-ink"
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  )
}

/** A palette as a split circle: background left, primary right, accent dot. */
export function PaletteSwatch({
  palette,
  className,
}: {
  palette: Palette
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative block size-9 overflow-hidden rounded-full",
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${palette.background} 0 50%, ${palette.primary} 50% 100%)`,
      }}
    >
      <span
        className="absolute right-1 bottom-1 size-2.5 rounded-full ring-1 ring-black/20"
        style={{ backgroundColor: palette.accent }}
      />
    </span>
  )
}
