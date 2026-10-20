import { describe, expect, it } from "vitest"
import { contrastRatio } from "./contrast"
import { PALETTES, getPalette, resolvePalette } from "./palettes"

describe("palettes", () => {
  it("ships at least 16 unique presets including the required ones", () => {
    expect(PALETTES.length).toBeGreaterThanOrEqual(16)
    expect(new Set(PALETTES.map((p) => p.id)).size).toBe(PALETTES.length)
    for (const id of [
      "ivory-gold",
      "sage",
      "dusty-rose",
      "navy-gold",
      "terracotta",
      "midnight",
      "monochrome",
      "corporate-blue",
    ]) {
      expect(PALETTES.some((p) => p.id === id)).toBe(true)
    }
  })

  it.each(PALETTES.map((p) => [p.id, p] as const))(
    "%s meets WCAG AA",
    (_id, p) => {
      expect(contrastRatio(p.foreground, p.background)).toBeGreaterThanOrEqual(
        4.5
      )
      expect(contrastRatio(p.primary, p.background)).toBeGreaterThanOrEqual(3)
      // "tint" bands mix secondary into the background; body text sits on them.
      expect(contrastRatio(p.foreground, p.secondary)).toBeGreaterThanOrEqual(
        4.5
      )
    }
  )

  it("falls back to ivory-gold for unknown ids", () => {
    expect(getPalette("nope").id).toBe("ivory-gold")
  })

  it("lets a custom palette override the preset and recompute the mode", () => {
    const p = resolvePalette({
      paletteId: "ivory-gold",
      custom: {
        primary: "#fff",
        secondary: "#222",
        accent: "#333",
        background: "#000",
        foreground: "#fff",
      },
    })
    expect(p.id).toBe("custom")
    expect(p.mode).toBe("dark")
    expect(p.background).toBe("#000")
  })
})
