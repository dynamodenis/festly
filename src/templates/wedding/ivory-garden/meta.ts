import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "wedding/ivory-garden",
  name: "Ivory Garden",
  category: "wedding",
  tags: ["classic", "serif", "garden", "gold", "elegant"],
  description:
    "Ivory and gold on textured paper: flowing silk, a monogram crest, botanical corner flourishes and arch-framed portraits. A timeless garden wedding.",
  thumbnail: "/thumbs/wedding-ivory-garden.webp",
  isPremium: false,
  supportedEventTypes: ["wedding", "engagement", "anniversary"],
  defaultPaletteId: "ivory-gold",
  defaultFontPairId: "playfair-inter",
  radius: "0.5rem",
  ornament: "leaf",
  grain: true,
  effects: { background: "silk", title: "split", gallery: "tilted" },
}
