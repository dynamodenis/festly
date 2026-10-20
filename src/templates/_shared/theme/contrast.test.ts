import { describe, expect, it } from "vitest"
import { colorMode, contrastRatio, meetsAA, parseColor } from "./contrast"

describe("contrast", () => {
  it("black on white is 21:1", () => {
    expect(contrastRatio("#000", "#ffffff")).toBeCloseTo(21, 1)
  })

  it("parses oklch and agrees with hex for white", () => {
    const white = parseColor("oklch(1 0 0)")
    expect(white).not.toBeNull()
    expect(white?.every((c) => c > 0.99)).toBe(true)
    expect(contrastRatio("oklch(0.145 0 0)", "#fff")).toBeGreaterThan(15)
  })

  it("rejects unknown notations", () => {
    expect(contrastRatio("red", "#fff")).toBeNull()
    expect(meetsAA("rgb(0,0,0)", "#fff")).toBe(false)
  })

  it("picks a light/dark hint from the background", () => {
    expect(colorMode("#f8f3ea")).toBe("light")
    expect(colorMode("#0f1b2d")).toBe("dark")
  })
})
