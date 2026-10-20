import { Link, createFileRoute } from "@tanstack/react-router"
import { TEMPLATE_METAS } from "@/templates/registry"
import { getPalette } from "@/templates/_shared/theme/palettes"

export const Route = createFileRoute("/dev/templates/")({
  head: () => ({ meta: [{ title: "Templates · Festly dev" }] }),
  component: TemplatesIndex,
})

function TemplatesIndex() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
        Phase 2 playground
      </p>
      <h1 className="mt-3 text-3xl font-semibold">Templates</h1>
      <p className="mt-2 text-muted-foreground">
        Each template renders with its defaults. Use the toolbar on a template
        page to switch mode, motion level, palette and font pair.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {TEMPLATE_METAS.map((meta) => {
          const palette = getPalette(meta.defaultPaletteId)
          return (
            <li key={meta.id}>
              <Link
                to="/dev/templates/$"
                params={{ _splat: meta.id }}
                className="block rounded-xl border p-5 transition-colors hover:bg-muted"
              >
                <div
                  aria-hidden="true"
                  className="mb-4 h-20 rounded-lg"
                  style={{
                    background: `linear-gradient(120deg, ${palette.background}, ${palette.secondary} 60%, ${palette.primary})`,
                  }}
                />
                <p className="text-xs text-muted-foreground uppercase">
                  {meta.category}
                </p>
                <h2 className="text-lg font-medium">{meta.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {meta.description}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {meta.effects.background ?? "no"} background ·{" "}
                  {meta.effects.title ?? "plain"} title
                </p>
              </Link>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
