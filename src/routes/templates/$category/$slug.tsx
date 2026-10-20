import {
  Link,
  createFileRoute,
  notFound,
  stripSearchParams,
  useNavigate,
} from "@tanstack/react-router"
import { ChevronLeft, ExternalLink, Sparkles } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { z } from "zod"
import { DeviceFrame } from "@/components/gallery/DeviceFrame"
import { DeviceToggle } from "@/components/gallery/DeviceToggle"
import { PaletteSwitcher } from "@/components/gallery/PaletteSwitcher"
import { SiteShell } from "@/components/gallery/SiteShell"
import { UseTemplateButton } from "@/components/gallery/UseTemplateButton"
import { DEVICE_IDS } from "@/lib/devices"
import { cn } from "@/lib/utils"
import { postToWindow, usePreviewMessages } from "@/lib/preview-bridge"
import { CATEGORY_LABELS } from "@/templates/catalog"
import { getFontPair } from "@/templates/_shared/theme/fonts"
import { hasPalette } from "@/templates/_shared/theme/palettes"
import { getTemplateMeta } from "@/templates/registry"
import type { TemplateMeta } from "@/templates/types"

const DetailSearch = z.object({
  device: z.enum(DEVICE_IDS).default("mobile").catch("mobile"),
  palette: z.string().max(60).refine(hasPalette).optional().catch(undefined),
})

export const Route = createFileRoute("/templates/$category/$slug")({
  validateSearch: DetailSearch,
  search: { middlewares: [stripSearchParams({ device: "mobile" })] },
  loader: ({ params }) => {
    const meta = getTemplateMeta(`${params.category}/${params.slug}`)
    if (!meta) throw notFound()
    return { id: meta.id }
  },
  head: ({ loaderData }) => {
    const meta = loaderData ? getTemplateMeta(loaderData.id) : undefined
    return {
      meta: meta
        ? [
            {
              title: `${meta.name} · ${CATEGORY_LABELS[meta.category]} invitation template · Festly`,
            },
            { name: "description", content: meta.description },
            {
              property: "og:title",
              content: `${meta.name} invitation template`,
            },
            { property: "og:description", content: meta.description },
          ]
        : [{ title: "Template · Festly" }],
    }
  },
  component: TemplateDetailPage,
})

const EFFECT_LABELS: Record<string, string> = {
  aurora: "Aurora sky",
  silk: "Flowing silk",
  particles: "Confetti particles",
  iridescence: "Iridescent sheen",
  waves: "Line waves",
  split: "Letter-by-letter title",
  blur: "Soft blur-in title",
  shiny: "Shining foil title",
  tilted: "Tilting photo cards",
  carousel: "Swipeable photo carousel",
}

function TemplateDetailPage() {
  const { id } = Route.useLoaderData()
  const meta = getTemplateMeta(id) as TemplateMeta
  const { device, palette } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const paletteId = palette ?? meta.defaultPaletteId
  const frame = useRef<HTMLIFrameElement>(null)
  const [loaded, setLoaded] = useState(false)

  // The iframe URL is fixed at first render; later palette changes travel by
  // postMessage so switching is instant and never reloads the preview.
  const [src] = useState(() => {
    const qs = new URLSearchParams()
    if (palette) qs.set("palette", palette)
    const query = qs.toString()
    return `/preview/${id}${query ? `?${query}` : ""}`
  })

  const sendTheme = useCallback(
    (next: string) =>
      postToWindow(frame.current?.contentWindow, {
        type: "festly:theme",
        paletteId: next,
      }),
    []
  )
  usePreviewMessages(
    () => frame.current?.contentWindow,
    (message) => {
      if (message.type === "festly:ready") {
        setLoaded(true)
        sendTheme(paletteId)
      }
    }
  )

  // Ask the preview to announce itself in case its own "ready" fired before
  // this page hydrated; the iframe load event is the last-resort fallback.
  useEffect(() => {
    postToWindow(frame.current?.contentWindow, { type: "festly:ping" })
  }, [])

  const pickPalette = (next: string) => {
    sendTheme(next)
    void navigate({
      search: (prev) => ({
        ...prev,
        palette: next === meta.defaultPaletteId ? undefined : next,
      }),
      replace: true,
      resetScroll: false,
    })
  }

  const effects = [
    meta.effects.background,
    meta.effects.title,
    meta.effects.gallery,
  ]
    .filter((e): e is NonNullable<typeof e> => !!e && e !== "none")
    .map((e) => EFFECT_LABELS[e] ?? e)
  const fonts = getFontPair(meta.defaultFontPairId)

  return (
    <SiteShell>
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-28 pb-20 sm:px-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16 lg:pt-32">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Link
            to="/templates"
            search={{ category: meta.category }}
            className="inline-flex items-center gap-1 link"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            {CATEGORY_LABELS[meta.category]} templates
          </Link>

          <p className="mt-8 eyebrow">{CATEGORY_LABELS[meta.category]}</p>
          <h1 className="mt-3 heading-2">{meta.name}</h1>
          <p className="mt-5 lead">{meta.description}</p>

          <ul aria-label="Tags" className="mt-6 flex flex-wrap gap-2">
            {meta.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-gold/15 px-3 py-1 text-xs text-sand"
              >
                {tag}
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-3xl border border-gold/10 bg-umber/50 p-6">
            <PaletteSwitcher
              value={paletteId}
              defaultId={meta.defaultPaletteId}
              onChange={pickPalette}
            />
          </div>

          <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
            <dt className="label">Type</dt>
            <dd className="text-cream" style={{ fontFamily: fonts.display }}>
              {fonts.name}
            </dd>
            {effects.length > 0 && (
              <>
                <dt className="label">Motion</dt>
                <dd className="flex flex-wrap gap-x-3 gap-y-1 text-cream">
                  {effects.map((effect) => (
                    <span
                      key={effect}
                      className="inline-flex items-center gap-1.5"
                    >
                      <Sparkles
                        className="size-3.5 text-gold"
                        aria-hidden="true"
                      />
                      {effect}
                    </span>
                  ))}
                </dd>
              </>
            )}
          </dl>

          <div className="mt-10 flex flex-col gap-4">
            <UseTemplateButton templateId={meta.id} paletteId={paletteId} />
            <a
              href={`/preview/${meta.id}${palette ? `?palette=${palette}` : ""}`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 link"
            >
              Open full-screen preview
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </aside>

        <section
          aria-label="Live preview"
          className="relative flex flex-col items-center gap-6"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-16 -z-10 mx-auto h-2/3 max-w-xl rounded-full bg-gold/10 blur-3xl"
          />
          <DeviceToggle
            value={device}
            onChange={(next) =>
              void navigate({
                search: (prev) => ({ ...prev, device: next }),
                replace: true,
                resetScroll: false,
              })
            }
          />
          <DeviceFrame device={device} className="h-[min(78svh,58rem)] w-full">
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-0 z-10 grid place-items-center bg-umber transition-opacity duration-500",
                loaded && "opacity-0"
              )}
            >
              <span className="size-10 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
            </div>
            <iframe
              ref={frame}
              src={src}
              onLoad={() => {
                postToWindow(frame.current?.contentWindow, {
                  type: "festly:ping",
                })
                window.setTimeout(() => setLoaded(true), 1500)
              }}
              title={`Live preview of the ${meta.name} template`}
              className="h-full w-full border-0"
            />
          </DeviceFrame>
          <p className="text-center text-xs text-sand">
            Sample content shown. Forms are disabled in preview.
          </p>
        </section>
      </div>
    </SiteShell>
  )
}
