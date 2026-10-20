import type { CSSProperties, ReactNode } from "react"
import { cn } from "@/lib/utils"
import type { Theme } from "../schema"
import { getFontPair } from "./fonts"
import { useEffectiveMotion } from "./motion"
import { resolvePalette, type Palette } from "./palettes"

export type ThemeVars = CSSProperties & Record<`--inv-${string}`, string>

/**
 * The inline custom properties every template root carries. `-root` copies
 * let tone wrappers (see styles.css) re-derive colors from the originals.
 */
export function themeVars(
  palette: Palette,
  fontPairId: string,
  radius: string
): ThemeVars {
  const fonts = getFontPair(fontPairId)
  return {
    "--inv-primary": palette.primary,
    "--inv-secondary": palette.secondary,
    "--inv-accent": palette.accent,
    "--inv-bg": palette.background,
    "--inv-fg": palette.foreground,
    "--inv-bg-root": palette.background,
    "--inv-fg-root": palette.foreground,
    "--inv-font-display": fonts.display,
    "--inv-font-body": fonts.body,
    "--inv-radius": radius,
  }
}

type ThemeScopeProps = {
  theme: Theme
  /** Corner radius the template was designed with, e.g. "0.5rem". */
  radius?: string
  /** Adds the paper-grain overlay (print-inspired templates). */
  grain?: boolean
  className?: string
  children: ReactNode
}

/**
 * Sets the `--inv-*` tokens inline on the template root so a template can be
 * themed per invitation without generating CSS. Tailwind's `inv-*` utilities
 * read these variables. `data-motion` gates every CSS ornament animation.
 */
export function ThemeScope({
  theme,
  radius = "0.75rem",
  grain = false,
  className,
  children,
}: ThemeScopeProps) {
  const palette = resolvePalette(theme)
  const motion = useEffectiveMotion(theme.motionLevel)
  return (
    <div
      data-inv-root=""
      data-mode={palette.mode}
      data-motion={motion}
      style={themeVars(palette, theme.fontPairId, radius)}
      className={cn(
        "inv-root relative min-h-svh bg-inv-bg font-inv-body text-inv-fg antialiased",
        grain && "inv-grain",
        className
      )}
    >
      {children}
    </div>
  )
}
