import { Link } from "@tanstack/react-router"
import { Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { CATEGORY_LABELS, templateParams } from "@/templates/catalog"
import { getPalette } from "@/templates/_shared/theme/palettes"
import type { TemplateMeta } from "@/templates/types"
import { PaletteDots } from "./PaletteDots"

/**
 * Gallery card: the template's cover screen in a phone silhouette, with a
 * shine sweep and lift on hover. The whole card is one link.
 */
export function TemplateCard({
  meta,
  priority = false,
}: {
  meta: TemplateMeta
  /** Above-the-fold cards load eagerly (first one gets fetchpriority=high). */
  priority?: boolean | "high"
}) {
  const palette = getPalette(meta.defaultPaletteId)
  return (
    <Link
      to="/templates/$category/$slug"
      params={templateParams(meta.id)}
      className="group block rounded-[2rem] focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-ink focus-visible:outline-none"
    >
      <article aria-labelledby={`card-${meta.id}`}>
        <div className="relative mx-auto aspect-[390/844] w-full overflow-hidden rounded-[2rem] border border-gold/15 bg-umber p-1.5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] transition-all duration-700 ease-out group-hover:-translate-y-2 group-hover:border-gold/45 group-hover:shadow-[0_40px_80px_-30px_rgba(201,160,90,0.4)]">
          <div
            className="relative h-full w-full overflow-hidden rounded-[1.6rem]"
            style={{ backgroundColor: palette.background }}
          >
            <img
              src={meta.thumbnail}
              alt=""
              width={390}
              height={844}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority === "high" ? "high" : "auto"}
              decoding="async"
              className="h-full w-full object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
            <span className="absolute inset-x-0 bottom-4 mx-auto flex w-max translate-y-3 items-center gap-2 rounded-full bg-ink/80 px-4 py-2 text-xs font-medium text-cream opacity-0 backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
              <Eye className="size-3.5 text-gold" aria-hidden="true" />
              Live preview
            </span>
          </div>
          {meta.isPremium && (
            <span className="absolute top-4 right-4 rounded-full bg-gold px-2.5 py-1 text-[0.6rem] font-semibold tracking-[0.2em] text-ink uppercase">
              Premium
            </span>
          )}
        </div>
        <div className="mt-5 flex items-start justify-between gap-3 px-1">
          <div className="min-w-0">
            <h3
              id={`card-${meta.id}`}
              className="heading-3 transition-colors group-hover:text-gold-soft"
            >
              {meta.name}
            </h3>
            <p className="mt-1 label">{CATEGORY_LABELS[meta.category]}</p>
          </div>
          <PaletteDots palette={palette} className="mt-1.5 shrink-0" />
        </div>
        <p className="mt-3 line-clamp-2 px-1 text-sm leading-relaxed text-sand">
          {meta.description}
        </p>
      </article>
    </Link>
  )
}

/** Placeholder card for a roadmap template (not a link). */
export function UpcomingCard({
  name,
  category,
  className,
}: {
  name: string
  category: string
  className?: string
}) {
  return (
    <li
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl border border-dashed border-gold/15 px-5 py-4",
        className
      )}
    >
      <span className="font-display text-lg text-cream/80">{name}</span>
      <span className="text-[0.6rem] tracking-[0.25em] text-sand/70 uppercase">
        {category}
      </span>
    </li>
  )
}
