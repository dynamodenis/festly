import { describe, expect, it } from "vitest"
import { SLUG_PATTERN, Slug, slugify, suggestSlug } from "./slug"

describe("slugs", () => {
  it("accepts well-formed slugs and normalizes case", () => {
    expect(Slug.parse("Amara-and-Kofi")).toBe("amara-and-kofi")
    expect(Slug.safeParse("abc").success).toBe(true)
  })

  it("rejects bad shapes and reserved words", () => {
    for (const bad of [
      "ab",
      "-abc",
      "abc-",
      "a b c",
      "über",
      "a--b",
      "x".repeat(61),
      "templates",
      "admin",
    ]) {
      expect(Slug.safeParse(bad).success, bad).toBe(false)
    }
  })

  it("slugifies names with accents and ampersands", () => {
    expect(slugify("Zoë & José!")).toBe("zoe-and-jose")
    expect(slugify("   ")).toBe("")
  })

  it("suggests a valid slug from names and date", () => {
    const s = suggestSlug("Amara & Kofi", "2027-06-12T15:00:00+03:00")
    expect(s).toBe("amara-and-kofi-2027")
    expect(SLUG_PATTERN.test(s)).toBe(true)
    expect(Slug.safeParse(suggestSlug("i")).success).toBe(true)
  })
})
