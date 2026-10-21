import { createFileRoute, notFound } from "@tanstack/react-router"
import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { deepMerge } from "@/lib/deep-merge"
import { DEVICE_IDS } from "@/lib/devices"
import { postToWindow, usePreviewMessages } from "@/lib/preview-bridge"
import { MotionLevel } from "@/templates/_shared/schema"
import { hasFontPair } from "@/templates/_shared/theme/fonts"
import { hasPalette } from "@/templates/_shared/theme/palettes"
import { TemplateRenderer } from "@/templates/TemplateRenderer"
import { getTemplateMeta, loadTemplate } from "@/templates/registry"

const PreviewSearch = z.object({
  device: z.enum(DEVICE_IDS).optional().catch(undefined),
  palette: z.string().max(60).refine(hasPalette).optional().catch(undefined),
  font: z.string().max(60).refine(hasFontPair).optional().catch(undefined),
  motion: MotionLevel.optional().catch(undefined),
})

const DEVICE_MAX = {
  mobile: "max-w-[390px]",
  tablet: "max-w-[820px]",
  desktop: "",
}

/**
 * Bare, chrome-free render of a template with its sample content. Used by the
 * gallery iframe, the full-screen preview link and `pnpm thumbs`. Theme
 * fields can be overridden by query string or, live, by `festly:theme`
 * messages from the parent page.
 */
export const Route = createFileRoute("/preview/$category/$slug")({
  validateSearch: PreviewSearch,
  loader: async ({ params }) => {
    const meta = getTemplateMeta(`${params.category}/${params.slug}`)
    if (!meta) throw notFound()
    const module = await loadTemplate(meta.id)
    return { id: meta.id, name: meta.name, defaults: module.defaults }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Template"} preview · Festly` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PreviewPage,
})

function PreviewPage() {
  const { id, defaults } = Route.useLoaderData()
  const search = Route.useSearch()
  // Full config pushed by the editor; theme overrides below still apply.
  const [pushed, setPushed] = useState<Record<string, unknown> | null>(null)
  const [live, setLive] = useState<{
    paletteId?: string
    fontPairId?: string
    motionLevel?: MotionLevel
  }>({})

  usePreviewMessages(
    () => (window.parent === window ? null : window.parent),
    (message) => {
      // Either page may hydrate first, so readiness is a handshake: the
      // preview announces itself on mount and answers every ping.
      if (message.type === "festly:ping") {
        postToWindow(window.parent, { type: "festly:ready", templateId: id })
        return
      }
      if (message.type === "festly:config") {
        setPushed(message.config)
        return
      }
      if (message.type !== "festly:theme") return
      setLive({
        paletteId:
          message.paletteId && hasPalette(message.paletteId)
            ? message.paletteId
            : undefined,
        fontPairId:
          message.fontPairId && hasFontPair(message.fontPairId)
            ? message.fontPairId
            : undefined,
        motionLevel: message.motionLevel,
      })
    }
  )

  const config = useMemo(
    () =>
      deepMerge(pushed ?? defaults, {
        theme: {
          paletteId: live.paletteId ?? search.palette,
          fontPairId: live.fontPairId ?? search.font,
          motionLevel: live.motionLevel ?? search.motion,
        },
      }),
    [pushed, defaults, live, search.palette, search.font, search.motion]
  )

  return (
    <div
      className={
        search.device ? `mx-auto ${DEVICE_MAX[search.device]}` : undefined
      }
    >
      <ReadySignal templateId={id} />
      <TemplateRenderer templateId={id} config={config} mode="preview" />
    </div>
  )
}

/** Tells a hosting page (if any) that the preview can now take messages. */
function ReadySignal({ templateId }: { templateId: string }) {
  useEffect(() => {
    if (window.parent !== window) {
      postToWindow(window.parent, { type: "festly:ready", templateId })
    }
  }, [templateId])
  return null
}
