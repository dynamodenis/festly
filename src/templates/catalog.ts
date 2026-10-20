import { TEMPLATE_METAS } from "./registry"
import {
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
  type TemplateMeta,
} from "./types"

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  wedding: "Wedding",
  birthday: "Birthday",
  graduation: "Graduation",
  baby_shower: "Baby Shower",
  anniversary: "Anniversary",
  corporate: "Corporate",
  other: "Other",
}

export const CATEGORY_FILTERS = ["all", ...TEMPLATE_CATEGORIES] as const
export type CategoryFilter = (typeof CATEGORY_FILTERS)[number]

export function categoryLabel(filter: CategoryFilter): string {
  return filter === "all" ? "All" : CATEGORY_LABELS[filter]
}

/**
 * Templates on the Phase 7 roadmap (docs/BUILD_PROMPT.md). Shown as
 * "coming soon" so empty categories still say what is planned. Remove an
 * entry when its template ships; a test keeps the two lists disjoint.
 */
export const UPCOMING_TEMPLATES: ReadonlyArray<{
  id: string
  name: string
  category: TemplateCategory
}> = [
  [
    "wedding",
    [
      "Midnight Aurora",
      "Javanese Heritage",
      "Minimal Mono",
      "Rustic Barn",
      "Boho Terracotta",
      "Royal Islamic",
      "Beach Sunset",
      "Cinema Reel",
      "Pastel Petals",
    ],
  ],
  [
    "birthday",
    [
      "Dino Adventure",
      "Princess Castle",
      "Neon Night",
      "Retro Arcade",
      "Golden Milestone",
      "Sweet Seventeen",
      "Garden Tea Party",
    ],
  ],
  [
    "graduation",
    [
      "Chalkboard",
      "Varsity",
      "Tech Terminal",
      "Starry Future",
      "Polaroid Memories",
    ],
  ],
  [
    "baby_shower",
    [
      "Cloud Nine",
      "Little Safari",
      "Gender Reveal",
      "Twinkle Star",
      "Botanical Sage",
      "Teddy Picnic",
    ],
  ],
  [
    "anniversary",
    [
      "Golden Years",
      "Silver Jubilee",
      "Love Letter",
      "Then and Now",
      "Vinyl Love Song",
    ],
  ],
  [
    "corporate",
    [
      "Product Launch",
      "Black Tie Gala",
      "Conference Grid",
      "Holiday Party",
      "Team Offsite",
      "Webinar Minimal",
    ],
  ],
  [
    "other",
    [
      "Engagement Sparkle",
      "Khitanan Ceria",
      "Aqiqah Soft",
      "Housewarming Keys",
      "Bridal Shower Blush",
      "Retirement Sunset",
      "Eid Open House",
      "Christmas Dinner",
      "Class Reunion",
    ],
  ],
].flatMap(([category, names]) =>
  (names as Array<string>).map((name) => ({
    category: category as TemplateCategory,
    name,
    id: `${category as string}/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  }))
)

/** Lowercase, strip accents and punctuation so "Café" matches "cafe". */
export function normalize(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

type Searchable = { name: string; category: TemplateCategory } & Partial<
  Pick<TemplateMeta, "description" | "tags">
>

function haystack(item: Searchable): string {
  return normalize(
    [
      item.name,
      CATEGORY_LABELS[item.category],
      item.description ?? "",
      ...(item.tags ?? []),
    ].join(" ")
  )
}

/** Every word of the query must appear somewhere (AND search). */
export function matchesQuery(item: Searchable, query: string): boolean {
  const words = normalize(query).split(" ").filter(Boolean)
  if (words.length === 0) return true
  const text = haystack(item)
  return words.every((word) => text.includes(word))
}

export type CatalogQuery = { category: CategoryFilter; q: string }

export function filterTemplates<T extends Searchable>(
  items: ReadonlyArray<T>,
  { category, q }: CatalogQuery
): Array<T> {
  return items.filter(
    (item) =>
      (category === "all" || item.category === category) &&
      matchesQuery(item, q)
  )
}

/** Available-template counts per filter tab, for the current query. */
export function categoryCounts(
  items: ReadonlyArray<Searchable>,
  q: string
): Record<CategoryFilter, number> {
  const counts = Object.fromEntries(
    CATEGORY_FILTERS.map((c) => [c, 0])
  ) as Record<CategoryFilter, number>
  for (const item of items) {
    if (!matchesQuery(item, q)) continue
    counts.all += 1
    counts[item.category] += 1
  }
  return counts
}

export function getCatalog(): ReadonlyArray<TemplateMeta> {
  return TEMPLATE_METAS
}

/** URL params for a template id ("wedding/ivory-garden" → category + slug). */
export function templateParams(id: string): { category: string; slug: string } {
  const [category = "", slug = ""] = id.split("/")
  return { category, slug }
}
