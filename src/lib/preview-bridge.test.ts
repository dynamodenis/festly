import { describe, expect, it } from "vitest"
import { PreviewMessage } from "./preview-bridge"

describe("PreviewMessage", () => {
  it("accepts theme overrides and ready pings", () => {
    expect(
      PreviewMessage.safeParse({ type: "festly:theme", paletteId: "sage" })
        .success
    ).toBe(true)
    expect(
      PreviewMessage.safeParse({
        type: "festly:ready",
        templateId: "wedding/ivory-garden",
      }).success
    ).toBe(true)
  })

  it("rejects unknown types and bad values", () => {
    expect(
      PreviewMessage.safeParse({ type: "festly:eval", code: "x" }).success
    ).toBe(false)
    expect(
      PreviewMessage.safeParse({ type: "festly:theme", motionLevel: "warp" })
        .success
    ).toBe(false)
    expect(PreviewMessage.safeParse("festly:theme").success).toBe(false)
  })
})
