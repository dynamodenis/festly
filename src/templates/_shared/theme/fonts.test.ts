import { describe, expect, it } from "vitest"
import { FONT_PAIRS, getFontPair } from "./fonts"

describe("font pairs", () => {
  it("ships at least 10 unique pairs with fallbacks", () => {
    expect(FONT_PAIRS.length).toBeGreaterThanOrEqual(10)
    expect(new Set(FONT_PAIRS.map((f) => f.id)).size).toBe(FONT_PAIRS.length)
    for (const pair of FONT_PAIRS) {
      expect(pair.display.split(",").length).toBeGreaterThan(1)
      expect(pair.body.split(",").length).toBeGreaterThan(1)
    }
  })

  it("falls back to the default pair", () => {
    expect(getFontPair("missing").id).toBe("playfair-inter")
  })
})
