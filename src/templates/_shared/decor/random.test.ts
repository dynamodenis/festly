import { describe, expect, it } from "vitest"
import { hashSeed, seeded } from "./random"

describe("seeded random", () => {
  it("is deterministic per seed (server and client must agree)", () => {
    const a = seeded(42)
    const b = seeded(42)
    const seqA = Array.from({ length: 5 }, a)
    expect(Array.from({ length: 5 }, b)).toEqual(seqA)
    expect(seqA.every((n) => n >= 0 && n < 1)).toBe(true)
  })

  it("differs between seeds", () => {
    expect(seeded(1)()).not.toBe(seeded(2)())
  })

  it("hashes strings stably", () => {
    expect(hashSeed("wedding/ivory-garden")).toBe(
      hashSeed("wedding/ivory-garden")
    )
    expect(hashSeed("a")).not.toBe(hashSeed("b"))
  })
})
