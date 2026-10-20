import {
  createFileRoute,
  stripSearchParams,
  useNavigate,
} from "@tanstack/react-router"
import { SearchX } from "lucide-react"
import { useCallback } from "react"
import { z } from "zod"
import { CategoryNav } from "@/components/gallery/CategoryNav"
import { SearchField } from "@/components/gallery/SearchField"
import { SiteShell } from "@/components/gallery/SiteShell"
import { TemplateCard, UpcomingCard } from "@/components/gallery/TemplateCard"
import { Ornament } from "@/components/landing/InvitationCard"
import {
  CATEGORY_FILTERS,
  CATEGORY_LABELS,
  UPCOMING_TEMPLATES,
  categoryCounts,
  categoryLabel,
  filterTemplates,
  getCatalog,
} from "@/templates/catalog"

const SEARCH_DEFAULTS = { category: "all", q: "" } as const

const GallerySearch = z.object({
  category: z.enum(CATEGORY_FILTERS).default("all").catch("all"),
  q: z.string().trim().max(80).default("").catch(""),
})

export const Route = createFileRoute("/templates/")({
  validateSearch: GallerySearch,
  search: { middlewares: [stripSearchParams(SEARCH_DEFAULTS)] },
  head: () => ({
    meta: [
      { title: "Invitation templates · Festly" },
      {
        name: "description",
        content:
          "Browse Festly invitation templates for weddings, birthdays, graduations and more. Preview each one live, then make it yours.",
      },
    ],
  }),
  component: GalleryPage,
})

function GalleryPage() {
  const { category, q } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const catalog = getCatalog()
  const results = filterTemplates(catalog, { category, q })
  const upcoming = filterTemplates(UPCOMING_TEMPLATES, { category, q })
  const counts = categoryCounts(catalog, q)

  const setQuery = useCallback(
    (next: string) =>
      void navigate({
        search: (prev) => ({ ...prev, q: next }),
        replace: true,
        resetScroll: false,
      }),
    [navigate]
  )
  const clear = () => void navigate({ search: {}, resetScroll: false })

  return (
    <SiteShell>
      <section className="relative isolate overflow-hidden px-4 pt-36 pb-12 sm:px-6 sm:pt-44">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(ellipse_at_top,rgba(201,160,90,0.18),transparent_65%)]"
        />
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Templates</p>
          <h1 className="mt-5 heading-1">
            Find your{" "}
            <span className="text-gold-gradient italic">grand entrance</span>
          </h1>
          <Ornament className="mx-auto mt-7 w-32 text-gold/60" />
          <p className="mx-auto mt-7 max-w-xl lead">
            Every template is a full invitation website: cover, countdown, map,
            RSVPs and wishes. Preview it live, pick a palette, make it yours.
          </p>
          <SearchField
            value={q}
            onChange={setQuery}
            className="mx-auto mt-10 max-w-lg"
          />
        </div>
      </section>

      <div className="sticky top-[4.25rem] z-30 border-y border-gold/10 bg-ink/80 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-6xl justify-center">
          <CategoryNav active={category} counts={counts} />
        </div>
      </div>

      <section
        aria-labelledby="results-heading"
        className="mx-auto max-w-6xl px-4 py-14 sm:px-6"
      >
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="results-heading" className="heading-3">
            {categoryLabel(category)} templates
          </h2>
          <p className="label" aria-live="polite">
            <span className="nums">{results.length}</span>{" "}
            {results.length === 1 ? "template" : "templates"}
            {q && <> for “{q}”</>}
          </p>
        </div>

        {results.length > 0 ? (
          <ul className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((meta, i) => (
              <li key={meta.id} className="mx-auto w-full max-w-sm">
                <TemplateCard meta={meta} priority={i === 0 ? "high" : i < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-gold/10 bg-umber/40 px-6 py-16 text-center">
            <SearchX className="size-8 text-gold" aria-hidden="true" />
            <p className="heading-3">
              {q
                ? "Nothing matches that search yet"
                : `${categoryLabel(category)} templates are on the way`}
            </p>
            <p className="max-w-md body-copy">
              {q
                ? "Try another word, or browse every category."
                : "We are designing these now. Meanwhile, any template can be restyled with your own colours and words."}
            </p>
            <button
              type="button"
              onClick={clear}
              className="mt-2 link underline underline-offset-4"
            >
              Show all templates
            </button>
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="mt-20">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="heading-3">Coming soon</h2>
              <p className="label">
                <span className="nums">{upcoming.length}</span> in the studio
              </p>
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming
                .slice(0, category === "all" ? 9 : undefined)
                .map((t) => (
                  <UpcomingCard
                    key={t.id}
                    name={t.name}
                    category={CATEGORY_LABELS[t.category]}
                  />
                ))}
            </ul>
          </div>
        )}
      </section>
    </SiteShell>
  )
}
