import { describe, expect, it } from "vitest"
import {
  CATEGORY_FILTERS,
  UPCOMING_TEMPLATES,
  categoryCounts,
  filterTemplates,
  matchesQuery,
  normalize,
  templateParams,
} from "./catalog"
import { TEMPLATE_METAS, hasTemplate } from "./registry"

describe("catalog search", () => {
  it("normalizes accents, case and punctuation", () => {
    expect(normalize("  Café-Noir!  ")).toBe("cafe noir")
  })

  it("matches name, category label, description and tags with AND semantics", () => {
    const ivory = TEMPLATE_METAS.find((m) => m.id === "wedding/ivory-garden")!
    expect(matchesQuery(ivory, "ivory")).toBe(true)
    expect(matchesQuery(ivory, "WEDDING gold")).toBe(true)
    expect(matchesQuery(ivory, "garden confetti")).toBe(false)
    expect(matchesQuery(ivory, "")).toBe(true)
  })

  it("matches multi-word category labels", () => {
    const item = { name: "Cloud Nine", category: "baby_shower" as const }
    expect(matchesQuery(item, "baby shower")).toBe(true)
  })

  it("filters by category and query together", () => {
    expect(
      filterTemplates(TEMPLATE_METAS, { category: "all", q: "" })
    ).toHaveLength(TEMPLATE_METAS.length)
    const birthdays = filterTemplates(TEMPLATE_METAS, {
      category: "birthday",
      q: "",
    })
    expect(birthdays.map((m) => m.id)).toEqual(["birthday/confetti-pop"])
    expect(
      filterTemplates(TEMPLATE_METAS, { category: "wedding", q: "confetti" })
    ).toEqual([])
  })

  it("counts every filter tab for the current query", () => {
    const counts = categoryCounts(TEMPLATE_METAS, "")
    expect(Object.keys(counts)).toEqual([...CATEGORY_FILTERS])
    expect(counts.all).toBe(TEMPLATE_METAS.length)
    expect(counts.wedding).toBe(1)
    expect(counts.corporate).toBe(0)
    expect(categoryCounts(TEMPLATE_METAS, "navy").all).toBe(1)
  })
})

describe("upcoming templates", () => {
  it("never lists a template that already shipped", () => {
    for (const item of UPCOMING_TEMPLATES)
      expect(hasTemplate(item.id)).toBe(false)
  })

  it("has unique ids in <category>/<slug> form", () => {
    const ids = UPCOMING_TEMPLATES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z_]+\/[a-z0-9-]+$/)
  })
})

describe("templateParams", () => {
  it("splits ids into route params", () => {
    expect(templateParams("graduation/cap-and-gown")).toEqual({
      category: "graduation",
      slug: "cap-and-gown",
    })
  })
})
