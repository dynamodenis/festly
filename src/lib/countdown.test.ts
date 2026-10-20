import { describe, expect, it } from "vitest"
import { countdownParts } from "./countdown"

describe("countdownParts", () => {
  it("splits the remaining time", () => {
    const now = Date.UTC(2027, 0, 1)
    const target = now + ((2 * 24 + 3) * 3600 + 4 * 60 + 5) * 1000
    expect(countdownParts(target, now)).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
      done: false,
    })
  })

  it("clamps to zero once passed", () => {
    expect(countdownParts(0, 1000)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      done: true,
    })
  })
})
