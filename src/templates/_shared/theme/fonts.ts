/**
 * Font pairs. Every family is self-hosted through Fontsource and declared in
 * `fonts.css` (imported once from `styles.css`). Browsers only download a
 * face when text actually uses it, so declaring all pairs costs CSS bytes only.
 */
export interface FontPair {
  id: string
  name: string
  /** Full CSS `font-family` stacks. */
  display: string
  body: string
  /** Short tag the gallery and editor can show. */
  vibe: string
}

const serif = "Georgia, 'Times New Roman', serif"
const sans = "system-ui, -apple-system, 'Segoe UI', sans-serif"
const script = "'Brush Script MT', cursive"

export const FONT_PAIRS: ReadonlyArray<FontPair> = [
  {
    id: "playfair-inter",
    name: "Playfair & Inter",
    display: `'Playfair Display Variable', ${serif}`,
    body: `'Inter Variable', ${sans}`,
    vibe: "classic",
  },
  {
    id: "cormorant-lora",
    name: "Cormorant & Lora",
    display: `'Cormorant Garamond Variable', ${serif}`,
    body: `'Lora Variable', ${serif}`,
    vibe: "romantic",
  },
  {
    id: "fraunces-dm-sans",
    name: "Fraunces & DM Sans",
    display: `'Fraunces Variable', ${serif}`,
    body: `'DM Sans Variable', ${sans}`,
    vibe: "editorial",
  },
  {
    id: "cinzel-garamond",
    name: "Cinzel & EB Garamond",
    display: `'Cinzel Variable', ${serif}`,
    body: `'EB Garamond Variable', ${serif}`,
    vibe: "formal",
  },
  {
    id: "great-vibes-raleway",
    name: "Great Vibes & Raleway",
    display: `'Great Vibes', ${script}`,
    body: `'Raleway Variable', ${sans}`,
    vibe: "script",
  },
  {
    id: "baloo-nunito",
    name: "Baloo & Nunito",
    display: `'Baloo 2 Variable', ${sans}`,
    body: `'Nunito Variable', ${sans}`,
    vibe: "playful",
  },
  {
    id: "bricolage-manrope",
    name: "Bricolage & Manrope",
    display: `'Bricolage Grotesque Variable', ${sans}`,
    body: `'Manrope Variable', ${sans}`,
    vibe: "modern",
  },
  {
    id: "bebas-montserrat",
    name: "Bebas & Montserrat",
    display: `'Bebas Neue', Impact, ${sans}`,
    body: `'Montserrat Variable', ${sans}`,
    vibe: "poster",
  },
  {
    id: "josefin-quicksand",
    name: "Josefin & Quicksand",
    display: `'Josefin Sans Variable', ${sans}`,
    body: `'Quicksand Variable', ${sans}`,
    vibe: "soft",
  },
  {
    id: "space-grotesk-inter",
    name: "Space Grotesk & Inter",
    display: `'Space Grotesk Variable', ${sans}`,
    body: `'Inter Variable', ${sans}`,
    vibe: "tech",
  },
  {
    id: "dancing-lora",
    name: "Dancing Script & Lora",
    display: `'Dancing Script Variable', ${script}`,
    body: `'Lora Variable', ${serif}`,
    vibe: "handwritten",
  },
  {
    id: "geist",
    name: "Geist",
    display: `'Geist Variable', ${sans}`,
    body: `'Geist Variable', ${sans}`,
    vibe: "minimal",
  },
]

export const DEFAULT_FONT_PAIR_ID = "playfair-inter"

const byId = new Map(FONT_PAIRS.map((f) => [f.id, f]))

export function getFontPair(id: string): FontPair {
  return byId.get(id) ?? byId.get(DEFAULT_FONT_PAIR_ID)!
}

export function hasFontPair(id: string): boolean {
  return byId.has(id)
}
