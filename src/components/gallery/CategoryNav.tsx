import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import {
  CATEGORY_FILTERS,
  categoryLabel,
  type CategoryFilter,
} from "@/templates/catalog"

/**
 * Category filters as links (each one is a shareable URL), so this is a nav
 * with aria-current rather than an ARIA tablist. Scrolls sideways on phones.
 */
export function CategoryNav({
  active,
  counts,
}: {
  active: CategoryFilter
  counts: Record<CategoryFilter, number>
}) {
  return (
    <nav
      aria-label="Template categories"
      className="-mx-4 min-w-0 [scrollbar-width:none] overflow-x-auto [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] px-4 sm:mx-0 sm:px-0 lg:[mask-image:none]"
    >
      <ul className="flex w-max gap-2 pr-8 lg:pr-0">
        {CATEGORY_FILTERS.map((category) => {
          const current = category === active
          return (
            <li key={category}>
              <Link
                to="/templates"
                search={(prev) => ({ ...prev, category })}
                aria-current={current ? "page" : undefined}
                resetScroll={false}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-all duration-300 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none",
                  current
                    ? "border-gold bg-gold text-ink"
                    : "border-gold/20 text-sand hover:border-gold/50 hover:text-cream"
                )}
              >
                {categoryLabel(category)}
                <span
                  className={cn(
                    "rounded-full px-1.5 nums text-xs",
                    current ? "bg-ink/15" : "bg-gold/10 text-gold-soft"
                  )}
                >
                  {counts[category]}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
