import { describe, expect, it, vi } from "vitest"
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

  it("falls back to defaults for garbage", async () => {
    const module = await loadTemplate("wedding/ivory-garden")
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const result = resolveConfig(module, { hosts: "not-an-array" })
    warn.mockRestore()
    error.mockRestore()
    expect(result.source).toBe("defaults")
    expect(result.config).toBe(module.defaults)
  })
})
