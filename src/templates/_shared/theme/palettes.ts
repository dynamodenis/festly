import type { CustomPalette, Theme } from "../schema"
import { colorMode } from "./contrast"

export type PaletteId = (typeof PALETTES)[number]["id"]

export interface Palette {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  /** Derived from the background; drives map tiles and WebGL `lightMode`. */
  mode: "light" | "dark"
}

type PaletteSeed = Omit<Palette, "mode">

const seed = <const T extends ReadonlyArray<PaletteSeed>>(list: T) =>
  list.map((p) => ({ ...p, mode: colorMode(p.background) })) as unknown as {
    [K in keyof T]: T[K] & { mode: "light" | "dark" }
  }

/**
 * Preset palettes. Every pair passes WCAG AA: foreground on background ≥ 4.5,
 * primary on background ≥ 3 (large text / UI). `palettes.test.ts` enforces it.
 */
export const PALETTES = seed([
  {
    id: "ivory-gold",
    name: "Ivory & Gold",
    primary: "#a8783a",
    secondary: "#e6cb95",
    accent: "#8a6236",
    background: "#f8f3ea",
    foreground: "#2a1e14",
  },
  {
    id: "sage",
    name: "Sage",
    primary: "#4f6e4d",
    secondary: "#c9d6c0",
    accent: "#8a6f4e",
    background: "#f3f5ef",
    foreground: "#1f2a22",
  },
  {
    id: "dusty-rose",
    name: "Dusty Rose",
    primary: "#a85d68",
    secondary: "#ead3d3",
    accent: "#7f5a4d",
    background: "#fbf2f1",
    foreground: "#3a2328",
  },
  {
    id: "navy-gold",
    name: "Navy & Gold",
    primary: "#d4af5a",
    secondary: "#243a5e",
    accent: "#e6cb95",
    background: "#0f1b2d",
    foreground: "#f3ead8",
  },
  {
    id: "terracotta",
    name: "Terracotta",
    primary: "#b85c38",
    secondary: "#f0d3c1",
    accent: "#6e4b3a",
    background: "#fbf0e6",
    foreground: "#3b2217",
  },
  {
    id: "midnight",
    name: "Midnight",
    primary: "#9b8cff",
    secondary: "#1a1f33",
    accent: "#f2c8ff",
    background: "#0b0d14",
    foreground: "#ece9f5",
  },
  {
    id: "monochrome",
    name: "Monochrome",
    primary: "#111111",
    secondary: "#e5e5e5",
    accent: "#6b6b6b",
    background: "#ffffff",
    foreground: "#111111",
  },
  {
    id: "corporate-blue",
    name: "Corporate Blue",
    primary: "#1f5fbf",
    secondary: "#d9e5f5",
    accent: "#0f3b7a",
    background: "#f5f8fc",
    foreground: "#10243e",
  },
  {
    id: "blush-champagne",
    name: "Blush & Champagne",
    primary: "#b5705f",
    secondary: "#f6dcd3",
    accent: "#a3754a",
    background: "#fff6f2",
    foreground: "#4a2c2a",
  },
  {
    id: "forest",
    name: "Forest",
    primary: "#8fd19e",
    secondary: "#1b3326",
    accent: "#e0c877",
    background: "#0f1f17",
    foreground: "#e8f0e9",
  },
  {
    id: "lavender",
    name: "Lavender",
    primary: "#6f5aa8",
    secondary: "#e2dbf3",
    accent: "#b78ab5",
    background: "#f6f3fb",
    foreground: "#2b2340",
  },
  {
    id: "ocean",
    name: "Ocean",
    primary: "#1b7f8c",
    secondary: "#cfe8ec",
    accent: "#e2a35a",
    background: "#eef7f9",
    foreground: "#0f2d36",
  },
  {
    id: "sunshine",
    name: "Sunshine",
    primary: "#b7780a",
    secondary: "#ffe08a",
    accent: "#e0552b",
    background: "#fffaea",
    foreground: "#3a2d10",
  },
  {
    id: "candy",
    name: "Candy",
    primary: "#d6336c",
    secondary: "#ffd6e5",
    accent: "#6d4de6",
    background: "#fff4f8",
    foreground: "#3c1a2b",
  },
  {
    id: "charcoal-copper",
    name: "Charcoal & Copper",
    primary: "#d49a6a",
    secondary: "#2d2a27",
    accent: "#c15f3c",
    background: "#1c1b1a",
    foreground: "#f1ebe4",
  },
  {
    id: "mint-cream",
    name: "Mint Cream",
    primary: "#2f8f6b",
    secondary: "#cdeee0",
    accent: "#e8a36c",
    background: "#f1faf6",
    foreground: "#163228",
  },
  {
    id: "royal-emerald",
    name: "Royal Emerald",
    primary: "#d9b65c",
    secondary: "#0f3b30",
    accent: "#8bd3b0",
    background: "#06231c",
    foreground: "#f0ebd8",
  },
  {
    id: "slate-minimal",
    name: "Slate Minimal",
    primary: "#3b4252",
    secondary: "#e4e6ea",
    accent: "#8c6b3f",
    background: "#f7f7f8",
    foreground: "#1b1d22",
  },
  {
    id: "peach-sorbet",
    name: "Peach Sorbet",
    primary: "#c7652c",
    secondary: "#ffd9bf",
    accent: "#6b8e5a",
    background: "#fff5ec",
    foreground: "#4b2a1a",
  },
  {
    id: "neon-night",
    name: "Neon Night",
    primary: "#39ff88",
    secondary: "#1c1c2e",
    accent: "#ff3d9a",
    background: "#0a0a12",
    foreground: "#f2f2ff",
  },
] as const)

export const DEFAULT_PALETTE_ID = "ivory-gold"

const byId = new Map<string, Palette>(PALETTES.map((p) => [p.id, p]))

export function getPalette(id: string): Palette {
  return byId.get(id) ?? byId.get(DEFAULT_PALETTE_ID)!
}

export function hasPalette(id: string): boolean {
  return byId.has(id)
}

/** The palette an invitation renders with: preset, overridden by `custom`. */
export function resolvePalette(
  theme: Pick<Theme, "paletteId" | "custom">
): Palette {
  const base = getPalette(theme.paletteId)
  if (!theme.custom) return base
  const custom: CustomPalette = theme.custom
  return {
    ...base,
    id: "custom",
    name: "Custom",
    ...custom,
    mode: colorMode(custom.background),
  }
}
