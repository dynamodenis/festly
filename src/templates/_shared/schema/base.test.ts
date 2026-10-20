import { describe, expect, it } from "vitest"
import { Color, InvitationConfigBase, MAX_GALLERY } from "./base"
import { sampleInvitationConfig } from "./sample"
import type { InvitationConfigBaseInput } from "./base"

const clone = (): InvitationConfigBaseInput =>
  structuredClone(sampleInvitationConfig)

const issuePaths = (input: unknown) => {
  const result = InvitationConfigBase.safeParse(input)
  return result.success ? [] : result.error.issues.map((i) => i.path.join("."))
}

describe("InvitationConfigBase", () => {
  it("parses the full sample", () => {
    const parsed = InvitationConfigBase.parse(sampleInvitationConfig)
    expect(parsed.hosts).toHaveLength(2)
    expect(parsed.venue.lat).toBeCloseTo(-1.2195)
  })

  it("applies defaults to a minimal config", () => {
    const minimal = clone()
    delete minimal.music
    delete minimal.gallery
    delete minimal.features
    delete minimal.gifts
    delete minimal.seo
    const parsed = InvitationConfigBase.parse(minimal)
    expect(parsed.gallery).toEqual([])
    expect(parsed.features.rsvp).toBe(true)
    expect(parsed.music.enabled).toBe(false)
    expect(parsed.theme.motionLevel).toBe("full")
  })

  describe("dates", () => {
    it("rejects a non-ISO start", () => {
      const bad = clone()
      bad.datetime.start = "12/06/2027 3pm"
      expect(issuePaths(bad)).toContain("datetime.start")
    })

    it("rejects a date-time without an offset", () => {
      const bad = clone()
      bad.datetime.start = "2027-06-12T15:00:00"
      expect(issuePaths(bad)).toContain("datetime.start")
    })

    it("rejects an end before the start", () => {
      const bad = clone()
      bad.datetime.end = "2027-06-11T10:00:00+03:00"
      expect(issuePaths(bad)).toContain("datetime.end")
    })

    it("rejects an unknown time zone", () => {
      const bad = clone()
      bad.datetime.timezone = "Mars/Olympus_Mons"
      expect(issuePaths(bad)).toContain("datetime.timezone")
    })

    it("rejects a sub-event that ends before it starts", () => {
      const bad = clone()
      bad.event.subEvents = [
        {
          label: "Ceremony",
          start: "2027-06-12T15:00:00+03:00",
          end: "2027-06-12T14:00:00+03:00",
        },
      ]
      expect(issuePaths(bad)).toContain("event.subEvents.0.end")
    })
  })

  describe("colors", () => {
    it.each([
      "#fff",
      "#c9a05a",
      "#C9A05A80",
      "oklch(0.7 0.1 80)",
      "oklch(70% 0.12 85deg / 0.5)",
    ])("accepts %s", (value) =>
      expect(Color.safeParse(value).success).toBe(true)
    )

    it.each([
      "red",
      "rgb(1,2,3)",
      "#12",
      "hsl(10 20% 30%)",
      "oklch(abc)",
      "#ggg",
    ])("rejects %s", (value) =>
      expect(Color.safeParse(value).success).toBe(false)
    )

    it("rejects a bad custom palette color inside a config", () => {
      const bad = clone()
      bad.theme.custom = {
        primary: "gold",
        secondary: "#8a6236",
        accent: "#e6cb95",
        background: "#110b07",
        foreground: "#f3e8d6",
      }
      expect(issuePaths(bad)).toContain("theme.custom.primary")
    })
  })

  it(`rejects more than ${MAX_GALLERY} gallery photos`, () => {
    const bad = clone()
    const photo = sampleInvitationConfig.gallery[0]
    bad.gallery = Array.from({ length: MAX_GALLERY + 1 }, (_, i) => ({
      ...photo,
      assetKey: `photo-${i}`,
    }))
    expect(issuePaths(bad)).toContain("gallery")

    const ok = clone()
    ok.gallery = bad.gallery.slice(0, MAX_GALLERY)
    expect(InvitationConfigBase.safeParse(ok).success).toBe(true)
  })

  it("rejects non-http links", () => {
    const bad = clone()
    bad.gifts = {
      enabled: true,
      registryLinks: [{ label: "x", url: "javascript:alert(1)" }],
    }
    expect(issuePaths(bad)).toContain("gifts.registryLinks.0.url")
  })

  it("rejects duplicate sections and half-set coordinates", () => {
    const bad = clone()
    bad.sectionsOrder = ["hero", "rsvp", "hero"]
    bad.venue.lng = undefined
    const paths = issuePaths(bad)
    expect(paths).toContain("sectionsOrder")
    expect(paths).toContain("venue.lng")
  })

  it("requires at least one host", () => {
    const bad = clone()
    bad.hosts = []
    expect(issuePaths(bad)).toContain("hosts")
  })
})
