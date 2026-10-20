/**
 * WCAG 2.x contrast for the two color notations the schema allows (hex and
 * oklch). Shared by palette tests now and the editor's live warning later.
 */

type Rgb = [number, number, number] // linear-light 0..1

const HEX = /^#([0-9a-f]{3,8})$/i
const OKLCH =
  /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*[\d.]+%?\s*)?\)$/i

const srgbToLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4

function parseHex(hex: string): Rgb | null {
  const m = HEX.exec(hex)
  if (!m) return null
  let h = m[1]
  if (h.length === 3 || h.length === 4) {
    h = h
      .split("")
      .map((ch) => ch + ch)
      .join("")
  }
  if (h.length !== 6 && h.length !== 8) return null
  const n = parseInt(h.slice(0, 6), 16)
  return [
    srgbToLinear(((n >> 16) & 255) / 255),
    srgbToLinear(((n >> 8) & 255) / 255),
    srgbToLinear((n & 255) / 255),
  ]
}

function parseOklch(value: string): Rgb | null {
  const m = OKLCH.exec(value)
  if (!m) return null
  const L = m[1].endsWith("%") ? parseFloat(m[1]) / 100 : parseFloat(m[1])
  const C = parseFloat(m[2])
  const h = (parseFloat(m[3]) * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)
  const l_ = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m_ = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s_ = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const clamp = (x: number) => Math.min(1, Math.max(0, x))
  return [
    clamp(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_),
    clamp(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_),
    clamp(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_),
  ]
}

export function parseColor(value: string): Rgb | null {
  const v = value.trim()
  return v.startsWith("#") ? parseHex(v) : parseOklch(v)
}

export function relativeLuminance(value: string): number | null {
  const rgb = parseColor(value)
  if (!rgb) return null
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
}

/** Contrast ratio 1..21, or null if either color cannot be parsed. */
export function contrastRatio(a: string, b: string): number | null {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  if (la === null || lb === null) return null
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

export const AA_BODY = 4.5
export const AA_LARGE = 3

export function meetsAA(fg: string, bg: string, large = false): boolean {
  const ratio = contrastRatio(fg, bg)
  return ratio !== null && ratio >= (large ? AA_LARGE : AA_BODY)
}

/** Light or dark hint for maps and effects, from the background's luminance. */
export function colorMode(background: string): "light" | "dark" {
  return (relativeLuminance(background) ?? 1) > 0.35 ? "light" : "dark"
}
