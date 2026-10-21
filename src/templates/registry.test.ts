import { existsSync } from "node:fs"
import { join } from "node:path"
import { beforeAll, describe, expect, it, vi } from "vitest"
import { SEED_TEMPLATES } from "@/server/db/seed"
import { hasFontPair } from "./_shared/theme/fonts"
import { hasPalette } from "./_shared/theme/palettes"
import {
  TEMPLATE_IDS,
  TEMPLATE_METAS,
  getTemplateMeta,
  hasTemplate,
  loadTemplate,
} from "./registry"
import { resolveConfig } from "./resolve-config"

// Cold-importing templates can take seconds when many test files load in
// parallel; do it once up front so it never counts against a single test.
beforeAll(async () => {
  await Promise.all(TEMPLATE_IDS.map((id) => loadTemplate(id)))
}, 30_000)

describe("template registry", () => {
  it("lists unique metas that match the lazy loaders", () => {
    expect(TEMPLATE_METAS.length).toBe(TEMPLATE_IDS.length)
    expect(new Set(TEMPLATE_METAS.map((m) => m.id)).size).toBe(
      TEMPLATE_METAS.length
    )
    for (const meta of TEMPLATE_METAS) {
      expect(hasTemplate(meta.id)).toBe(true)
      expect(meta.id.startsWith(`${meta.category}/`)).toBe(true)
      expect(hasPalette(meta.defaultPaletteId)).toBe(true)
      expect(hasFontPair(meta.defaultFontPairId)).toBe(true)
    }
  })

  it("ships a generated thumbnail for every template (run `pnpm thumbs`)", () => {
    for (const meta of TEMPLATE_METAS) {
      expect(meta.thumbnail).toMatch(/^\/thumbs\/[a-z0-9-]+\.webp$/)
      expect(existsSync(join("public", meta.thumbnail)), meta.thumbnail).toBe(
        true
      )
    }
  })

  it("covers every template the seed inserts", () => {
    for (const row of SEED_TEMPLATES) {
      expect(hasTemplate(row.id)).toBe(true)
      expect(getTemplateMeta(row.id)?.category).toBe(row.category)
    }
  })

  it.each(TEMPLATE_IDS)(
    "%s loads and its defaults satisfy its schema",
    async (id) => {
      const module = await loadTemplate(id)
      expect(module.meta.id).toBe(id)
      expect(module.meta).toBe(getTemplateMeta(id))
      expect(module.schema.safeParse(module.defaults).success).toBe(true)
      expect(module.defaults.theme.paletteId).toBe(module.meta.defaultPaletteId)
      expect(module.defaults.theme.fontPairId).toBe(
        module.meta.defaultFontPairId
      )
      expect(typeof module.Component).toBe("function")
    }
  )

  it("rejects unknown ids", async () => {
    expect(hasTemplate("nope/nothing")).toBe(false)
    await expect(loadTemplate("nope/nothing")).rejects.toThrow(
      /Unknown template/
    )
  })

  it("shares one promise per id", () => {
    expect(loadTemplate("wedding/ivory-garden")).toBe(
      loadTemplate("wedding/ivory-garden")
    )
  })
})

describe("resolveConfig", () => {
  it("passes a valid config through untouched", async () => {
    const module = await loadTemplate("birthday/confetti-pop")
    const result = resolveConfig(module, module.defaults)
    expect(result.source).toBe("config")
    expect(result.issues).toBeNull()
  })

  it("fills template-specific fields from defaults when missing", async () => {
    const module = await loadTemplate("birthday/confetti-pop")
    const { age: _age, ...withoutAge } =
      module.defaults as typeof module.defaults & { age: number }
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const result = resolveConfig(module, {
      ...withoutAge,
      texts: { ...withoutAge.texts, headline: "Kept" },
    })
    warn.mockRestore()
    expect(result.source).toBe("merged-defaults")
    expect(result.issues?.length).toBeGreaterThan(0)
    expect(result.config.texts.headline).toBe("Kept")
    expect((result.config as { age?: number }).age).toBe(7)
  })

  it("repairs only the broken fields and keeps the rest", async () => {
    const module = await loadTemplate("wedding/ivory-garden")
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const edited = {
      ...module.defaults,
      texts: {
        ...module.defaults.texts,
        headline: "",
        message: "Kept message",
      },
      hosts: "not-an-array",
    }
    const result = resolveConfig(module, edited)
    warn.mockRestore()
    expect(result.source).toBe("repaired")
    expect(result.config.texts.headline).toBe(module.defaults.texts.headline)
    expect(result.config.texts.message).toBe("Kept message")
    expect(result.config.hosts).toEqual(module.defaults.hosts)
  })

  it("drops invalid list items that have no default counterpart", async () => {
    const module = await loadTemplate("wedding/ivory-garden")
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const story = [
      ...module.defaults.story,
      ...module.defaults.story,
      { title: "", body: "x" },
    ]
    const result = resolveConfig(module, { ...module.defaults, story })
    warn.mockRestore()
    expect(result.source).toBe("repaired")
    expect(result.config.story).toHaveLength(story.length - 1)
  })

  it("falls back to defaults only when nothing is salvageable", async () => {
    const module = await loadTemplate("wedding/ivory-garden")
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const result = resolveConfig(module, "garbage")
    error.mockRestore()
    warn.mockRestore()
    expect(["defaults", "repaired"]).toContain(result.source)
    expect(module.schema.safeParse(result.config).success).toBe(true)
  })
})
