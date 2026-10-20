import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "birthday/confetti-pop",
  name: "Confetti Pop",
  category: "birthday",
  tags: ["playful", "bright", "confetti", "rounded", "kids", "party"],
  description:
    "Candy colours, chunky rounded type and confetti everywhere: falling particles, a sticker-style age badge, ring countdown and a swipeable photo carousel.",
  thumbnail: "/thumbs/birthday-confetti-pop.webp",
  isPremium: false,
  supportedEventTypes: ["birthday", "other"],
  defaultPaletteId: "candy",
  defaultFontPairId: "baloo-nunito",
  radius: "1.5rem",
  ornament: "wave",
  effects: { background: "particles", title: "blur", gallery: "carousel" },
}
