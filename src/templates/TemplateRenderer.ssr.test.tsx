// @vitest-environment node
// Runs without jsdom on purpose: any `window`/`document` access during render
// throws here, which is exactly what SSR would hit.
import { renderToString } from "react-dom/server"
import { beforeAll, describe, expect, it } from "vitest"
import { deepMerge } from "@/lib/deep-merge"
import { TEMPLATE_IDS, loadTemplate } from "./registry"
import { TemplateView } from "./TemplateRenderer"

/** React escapes quotes and ampersands in text; undo that for plain assertions. */
const unescape = (html: string) =>
  html
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")

// Cold-importing a template (blocks, effects, schema) can take seconds on a
// busy machine; do it once up front so it never counts against a test.
beforeAll(async () => {
  await Promise.all(TEMPLATE_IDS.map((id) => loadTemplate(id)))
}, 30_000)

describe.each(TEMPLATE_IDS)("SSR of %s", (id) => {
  it("renders the full page with no canvas or browser globals", async () => {
    const module = await loadTemplate(id)
    const html = unescape(
      renderToString(
        <TemplateView
          module={module}
          config={module.defaults}
          mode="public"
          slug="demo"
        />
      )
    )
    const { texts, venue, hosts } = module.defaults
    expect(html).toContain(texts.coverButtonLabel)
    expect(html).toContain(venue.address)
    expect(html).toContain(hosts[0].shortName ?? hosts[0].name)
    expect(html).toContain('data-inv-root=""')
    expect(html).toContain("--inv-primary")
    // WebGL/GSAP never render on the server: the static fallback does.
    expect(html).not.toContain("<canvas")
    expect(html).not.toContain("split-parent")
    // Cover is a normal first screen before hydration (readable without JS).
    expect(html).toContain('data-state="inline"')
    // ics link appears because a slug was given.
    expect(html).toContain("/ics/demo")
  })

  it('with motionLevel "none" marks every background static', async () => {
    const module = await loadTemplate(id)
    const config = deepMerge(module.defaults, {
      theme: { motionLevel: "none" },
    })
    const html = renderToString(
      <TemplateView module={module} config={config} mode="preview" />
    )
    expect(html).toContain('data-fx="static"')
    expect(html).not.toMatch(
      /data-fx="(aurora|silk|particles|iridescence|waves)"/
    )
  })

  it("keeps the animated background marker when motion is full", async () => {
    const module = await loadTemplate(id)
    const html = renderToString(
      <TemplateView module={module} config={module.defaults} mode="preview" />
    )
    const kind = module.meta.effects.background
    if (kind && kind !== "none") expect(html).toContain(`data-fx="${kind}"`)
  })

  it("is deterministic (seeded decor cannot break hydration)", async () => {
    const module = await loadTemplate(id)
    const render = () =>
      renderToString(
        <TemplateView module={module} config={module.defaults} mode="public" />
      )
    expect(render()).toBe(render())
  })

  it("uses the template ornament unless the invitation overrides it", async () => {
    const module = await loadTemplate(id)
    const own = renderToString(
      <TemplateView module={module} config={module.defaults} mode="preview" />
    )
    if (module.meta.ornament) {
      expect(own).toContain(`data-ornament="${module.meta.ornament}"`)
    }
    const config = deepMerge(module.defaults, {
      theme: { ornament: "diamond" },
    })
    const overridden = renderToString(
      <TemplateView module={module} config={config} mode="preview" />
    )
    expect(overridden).toContain('data-ornament="diamond"')
    expect(overridden).not.toMatch(/data-ornament="(leaf|wave|star|dots|line)"/)
  })

  it("writes the motion level on the root for CSS ornaments", async () => {
    const module = await loadTemplate(id)
    const config = deepMerge(module.defaults, {
      theme: { motionLevel: "none" },
    })
    const html = renderToString(
      <TemplateView module={module} config={config} mode="preview" />
    )
    expect(html).toContain('data-motion="none"')
  })
})
