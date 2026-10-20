import { describe, expect, it } from "vitest"
import { resolveOrnament } from "./context"

describe("resolveOrnament", () => {
  it("prefers a valid configured ornament", () => {
    expect(resolveOrnament("star", "leaf")).toBe("star")
  })

  it("falls back to the template default for unknown or missing values", () => {
    expect(resolveOrnament("sparkle-unicorn", "leaf")).toBe("leaf")
    expect(resolveOrnament(undefined, "wave")).toBe("wave")
    expect(resolveOrnament(undefined)).toBe("line")
  })
})
