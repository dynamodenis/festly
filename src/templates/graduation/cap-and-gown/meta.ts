import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "graduation/cap-and-gown",
  name: "Cap & Gown",
  category: "graduation",
  tags: ["formal", "navy", "gold", "aurora", "milestones", "academic"],
  description:
    'Midnight navy and gold foil: a starry sky under a slow aurora, a shining "Class of" headline, a diploma card with an embossed seal and a milestones grid.',
  thumbnail: "/thumbs/graduation-cap-and-gown.webp",
  isPremium: false,
  supportedEventTypes: ["graduation", "corporate", "other"],
  defaultPaletteId: "navy-gold",
  defaultFontPairId: "cinzel-garamond",
  radius: "0.25rem",
  ornament: "star",
  effects: { background: "aurora", title: "shiny", gallery: "none" },
}
