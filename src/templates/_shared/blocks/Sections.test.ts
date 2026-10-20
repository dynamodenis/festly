import { describe, expect, it } from "vitest"
import { sampleInvitationConfig } from "../schema"
import { isSectionEnabled } from "./Sections"

describe("isSectionEnabled", () => {
  it("always keeps structural sections", () => {
    expect(isSectionEnabled("hero", sampleInvitationConfig)).toBe(true)
    expect(isSectionEnabled("closing", sampleInvitationConfig)).toBe(true)
  })

  it("honours feature flags and empty content", () => {
    const off = {
      ...sampleInvitationConfig,
      features: { ...sampleInvitationConfig.features, rsvp: false },
      gallery: [],
      gifts: { ...sampleInvitationConfig.gifts, enabled: false },
    }
    expect(isSectionEnabled("rsvp", off)).toBe(false)
    expect(isSectionEnabled("gallery", off)).toBe(false)
    expect(isSectionEnabled("gifts", off)).toBe(false)
    expect(isSectionEnabled("map", off)).toBe(true)
  })
})
