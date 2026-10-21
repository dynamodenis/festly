// Editor persistence: autosave with optimistic concurrency, slugs, publish,
// and the public read. Pure functions over a Drizzle db (tested on PGlite).
import { and, eq, ne, sql } from "drizzle-orm"
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"
import { RESERVED_SLUGS, SLUG_PATTERN } from "@/lib/slug"
import { loadTemplate } from "@/templates/registry"
import * as schema from "@/server/db/schema"

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>
const inv = schema.invitations

/** Errors safe to show in the editor. */
export class EditorError extends Error {
  constructor(
    message: string,
    readonly code:
      "not_found" | "invalid" | "conflict" | "slug_taken" | "slug_invalid"
  ) {
    super(message)
    this.name = "EditorError"
  }
}

export type SaveResult = { updatedAt: string }

/** Postgres keeps microseconds; JS dates keep milliseconds. Compare at ms. */
const sameMillis = (iso: string) =>
  sql`date_trunc('milliseconds', ${inv.updatedAt}) = ${new Date(iso).toISOString()}::timestamptz`

async function ownedTemplateId(db: AnyDb, id: string, ownerId: string) {
  const row = (
    await db
      .select({ templateId: inv.templateId, status: inv.status })
      .from(inv)
      .where(and(eq(inv.id, id), eq(inv.ownerId, ownerId)))
  ).at(0)
  if (!row) throw new EditorError("Invitation not found.", "not_found")
  return row
}

export async function validateForTemplate(templateId: string, config: unknown) {
  const module = await loadTemplate(templateId)
  return module.schema.safeParse(config)
}

/**
 * Autosave. `baseUpdatedAt` is the version the editor loaded; if the row
 * changed since (another tab, another device) we refuse unless `force`.
 */
export async function saveDraft(
  db: AnyDb,
  input: {
    id: string
    ownerId: string
    config: unknown
    baseUpdatedAt: string
    force?: boolean
  }
): Promise<SaveResult> {
  const { templateId } = await ownedTemplateId(db, input.id, input.ownerId)
  const parsed = await validateForTemplate(templateId, input.config)
  if (!parsed.success)
    throw new EditorError(
      "Some fields need attention before saving.",
      "invalid"
    )

  const now = new Date()
  const where = and(
    eq(inv.id, input.id),
    eq(inv.ownerId, input.ownerId),
    input.force ? undefined : sameMillis(input.baseUpdatedAt)
  )
  const updated = await db
    .update(inv)
    .set({ draftConfig: parsed.data, updatedAt: now })
    .where(where)
    .returning({ updatedAt: inv.updatedAt })
  const row = updated.at(0)
  if (!row)
    throw new EditorError(
      "This invitation was changed somewhere else.",
      "conflict"
    )
  return { updatedAt: row.updatedAt.toISOString() }
}

export type SlugCheck =
  { available: true } | { available: false; reason: string }

export async function checkSlug(
  db: AnyDb,
  input: { slug: string; id?: string }
): Promise<SlugCheck> {
  const slug = input.slug.trim().toLowerCase()
  if (!SLUG_PATTERN.test(slug) || slug.includes("--")) {
    return {
      available: false,
      reason: "Use 3–60 lowercase letters, numbers or dashes.",
    }
  }
  if (RESERVED_SLUGS.has(slug))
    return { available: false, reason: "That address is reserved." }
  const clash = await db
    .select({ id: inv.id })
    .from(inv)
    .where(
      input.id
        ? and(eq(inv.slug, slug), ne(inv.id, input.id))
        : eq(inv.slug, slug)
    )
  return clash.length
    ? { available: false, reason: "That address is already taken." }
    : { available: true }
}

/** Publish (or republish) the current draft at `slug`. */
export async function publishInvitation(
  db: AnyDb,
  input: { id: string; ownerId: string; slug: string }
) {
  const { templateId } = await ownedTemplateId(db, input.id, input.ownerId)
  const check = await checkSlug(db, { slug: input.slug, id: input.id })
  if (!check.available)
    throw new EditorError(
      check.reason,
      check.reason.includes("taken") ? "slug_taken" : "slug_invalid"
    )

  const draft = (
    await db
      .select({ draftConfig: inv.draftConfig })
      .from(inv)
      .where(eq(inv.id, input.id))
  ).at(0)
  const parsed = await validateForTemplate(templateId, draft?.draftConfig)
  if (!parsed.success)
    throw new EditorError(
      "Fix the highlighted fields before publishing.",
      "invalid"
    )

  const slug = input.slug.trim().toLowerCase()
  const now = new Date()
  try {
    const [row] = await db
      .update(inv)
      .set({
        slug,
        status: "published",
        publishedConfig: parsed.data,
        publishedAt: now,
        updatedAt: now,
      })
      .where(and(eq(inv.id, input.id), eq(inv.ownerId, input.ownerId)))
      .returning({
        slug: inv.slug,
        publishedAt: inv.publishedAt,
        updatedAt: inv.updatedAt,
      })
    return {
      slug: row.slug ?? slug,
      publishedAt: (row.publishedAt ?? now).toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }
  } catch (error) {
    // A concurrent publish grabbed the slug between check and update.
    if (
      String(error).includes("invitations_slug_unique") ||
      String((error as { cause?: unknown }).cause).includes("unique")
    ) {
      throw new EditorError("That address is already taken.", "slug_taken")
    }
    throw error
  }
}

/** The public page's data: published invitations only. */
export async function getPublishedBySlug(db: AnyDb, slug: string) {
  const row = (
    await db
      .select({
        id: inv.id,
        templateId: inv.templateId,
        slug: inv.slug,
        config: inv.publishedConfig,
        publishedAt: inv.publishedAt,
      })
      .from(inv)
      .where(and(eq(inv.slug, slug.toLowerCase()), eq(inv.status, "published")))
  ).at(0)
  if (!row?.config || !row.slug) return null
  return {
    id: row.id,
    templateId: row.templateId,
    slug: row.slug,
    config: row.config,
    publishedAt: row.publishedAt?.toISOString() ?? null,
  }
}
