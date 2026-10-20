import { Link, createFileRoute, notFound } from "@tanstack/react-router"
import { z } from "zod"
import { MotionLevel } from "@/templates/_shared/schema"
import { ORNAMENTS } from "@/templates/types"
import { FONT_PAIRS } from "@/templates/_shared/theme/fonts"
import { PALETTES } from "@/templates/_shared/theme/palettes"
import { TemplateRenderer } from "@/templates/TemplateRenderer"
import { hasTemplate, loadTemplate } from "@/templates/registry"
import { deepMerge } from "@/lib/deep-merge"

const DevSearch = z.object({
  mode: z.enum(["preview", "public"]).optional().catch(undefined),
  motion: MotionLevel.optional().catch(undefined),
  palette: z.string().max(60).optional().catch(undefined),
  font: z.string().max(60).optional().catch(undefined),
  guest: z.string().max(80).optional().catch(undefined),
  ornament: z.enum(ORNAMENTS).optional().catch(undefined),
})
type DevSearch = z.infer<typeof DevSearch>

export const Route = createFileRoute("/dev/templates/$")({
  validateSearch: (search: Record<string, unknown>) => DevSearch.parse(search),
  loader: async ({ params }) => {
    const id = params._splat ?? ""
    if (!hasTemplate(id)) throw notFound()
    const module = await loadTemplate(id)
    // Defaults are plain JSON, so they serialize through the loader.
    return { id, name: module.meta.name, defaults: module.defaults }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.name ?? "Template"} · Festly dev` }],
  }),
  component: TemplatePage,
})

function TemplatePage() {
  const { id, defaults } = Route.useLoaderData()
  const search = Route.useSearch()
  const mode = search.mode ?? "preview"
  const config = deepMerge(defaults, {
    theme: {
      motionLevel: search.motion,
      paletteId: search.palette,
      fontPairId: search.font,
      ornament: search.ornament,
    },
  })

  return (
    <>
      <DevToolbar id={id} search={search} />
      <TemplateRenderer
        templateId={id}
        config={config}
        mode={mode}
        guestName={search.guest}
        slug={mode === "public" ? "preview-slug" : undefined}
      />
    </>
  )
}

function DevToolbar({ id, search }: { id: string; search: DevSearch }) {
  const link = (patch: Partial<DevSearch>) => ({
    to: "/dev/templates/$" as const,
    params: { _splat: id },
    search: (prev: DevSearch) => ({ ...prev, ...patch }),
  })
  const selectClass = "rounded border bg-background px-1 py-0.5 text-xs"
  return (
    <details className="fixed top-3 left-3 z-[60] rounded-lg border bg-background/95 text-xs text-foreground shadow-lg backdrop-blur [&[open]]:w-72">
      <summary className="cursor-pointer px-3 py-2 font-medium select-none">
        dev · {id} · {search.mode ?? "preview"} · motion{" "}
        {search.motion ?? "default"}
      </summary>
      <div className="flex flex-col gap-3 border-t p-3">
        <div className="flex flex-wrap gap-1">
          <span className="w-14 text-muted-foreground">mode</span>
          {(["preview", "public"] as const).map((mode) => (
            <Link
              key={mode}
              {...link({ mode })}
              className="rounded border px-2 py-0.5 data-[active=true]:bg-foreground data-[active=true]:text-background"
              data-active={(search.mode ?? "preview") === mode}
            >
              {mode}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          <span className="w-14 text-muted-foreground">motion</span>
          {MotionLevel.options.map((motion) => (
            <Link
              key={motion}
              {...link({ motion })}
              className="rounded border px-2 py-0.5 data-[active=true]:bg-foreground data-[active=true]:text-background"
              data-active={search.motion === motion}
            >
              {motion}
            </Link>
          ))}
        </div>
        <SearchSelect
          label="palette"
          value={search.palette}
          options={PALETTES.map((p) => p.id)}
          id={id}
          search={search}
          className={selectClass}
        />
        <SearchSelect
          label="font"
          value={search.font}
          options={FONT_PAIRS.map((f) => f.id)}
          id={id}
          search={search}
          className={selectClass}
        />
        <SearchSelect
          label="ornament"
          value={search.ornament}
          options={[...ORNAMENTS]}
          id={id}
          search={search}
          className={selectClass}
        />
        <Link
          to="/dev/templates"
          className="text-muted-foreground underline-offset-2 hover:underline"
        >
          ← all templates
        </Link>
      </div>
    </details>
  )
}

function SearchSelect({
  label,
  value,
  options,
  id,
  search,
  className,
}: {
  label: "palette" | "font" | "ornament"
  value: string | undefined
  options: Array<string>
  id: string
  search: DevSearch
  className: string
}) {
  const navigate = Route.useNavigate()
  return (
    <label className="flex items-center gap-2">
      <span className="w-14 text-muted-foreground">{label}</span>
      <select
        className={className}
        value={value ?? ""}
        onChange={(event) =>
          navigate({
            to: "/dev/templates/$",
            params: { _splat: id },
            search: { ...search, [label]: event.target.value || undefined },
          })
        }
      >
        <option value="">template default</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}
