import { z } from "zod"

/** Same rule as the invitations_slug_format check constraint (3–60 chars). */
export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,58})[a-z0-9]$/

/** Words that would collide with app routes or look official. */
export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "app",
  "assets",
  "auth",
  "dashboard",
  "dev",
  "editor",
  "festly",
  "help",
  "i",
  "ics",
  "login",
  "logout",
  "media",
  "new",
  "og",
  "preview",
  "pricing",
  "privacy",
  "settings",
  "signin",
  "signup",
  "static",
  "support",
  "templates",
  "terms",
  "thumbs",
  "www",
])

export const Slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    SLUG_PATTERN,
    "Use 3–60 lowercase letters, numbers or dashes, starting and ending with a letter or number"
  )
  .refine((s) => !s.includes("--"), "Avoid double dashes")
  .refine((s) => !RESERVED_SLUGS.has(s), "That address is reserved")

export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
    .replace(/-$/, "")
}

/** "Amara & Kofi" + 2027-06-12 → "amara-and-kofi-2027". */
export function suggestSlug(names: string, isoDate?: string): string {
  const base = slugify(names) || "invitation"
  const year = isoDate?.slice(0, 4)
  const withYear = year && /^\d{4}$/.test(year) ? `${base}-${year}` : base
  const slug = withYear.length >= 3 ? withYear : `${withYear}-party`
  return RESERVED_SLUGS.has(slug) ? `${slug}-invite` : slug
}
