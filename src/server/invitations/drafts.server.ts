// Draft invitations: create from a template, read back for the owner.
// Pure functions over a Drizzle db so tests can run them against PGlite.
import { and, eq } from "drizzle-orm"
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"
import { deepMerge } from "@/lib/deep-merge"
import type { InvitationConfigBase } from "@/templates/_shared/schema"
import { hasPalette } from "@/templates/_shared/theme/palettes"
import { getTemplateMeta, loadTemplate } from "@/templates/registry"
import * as schema from "@/server/db/schema"

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>

export class UnknownTemplateError extends Error {
  constructor(id: string) {
    super(`Unknown template "${id}"`)
    this.name = "UnknownTemplateError"
  }
}

export type CreateDraftInput = {
  ownerId: string
  templateId: string
  /** Palette picked in the gallery's quick-switcher. */
  paletteId?: string
}

/**
 * Insert a draft whose config is the template's defaults (plus the chosen
 * palette). The config is re-parsed with the template's own schema so a
 * draft row is always valid for the template that renders it.
 */
export async function createDraft(db: AnyDb, input: CreateDraftInput) {
  const meta = getTemplateMeta(input.templateId)
  if (!meta) throw new UnknownTemplateError(input.templateId)
  const module = await loadTemplate(meta.id)

  const theme =
    input.paletteId && hasPalette(input.paletteId)
      ? { theme: { paletteId: input.paletteId } }
      : {}
  const draftConfig: InvitationConfigBase = module.schema.parse(
    deepMerge(module.defaults, theme)
  )

  // The registry is the source of truth; make sure the FK target exists even
  // if the seed has not been run on this database.
  await db
    .insert(schema.templatesMeta)
    .values({
      id: meta.id,
      category: meta.category,
      name: meta.name,
      isPremium: meta.isPremium,
    })
    .onConflictDoNothing()

  const [row] = await db
    .insert(schema.invitations)
    .values({ ownerId: input.ownerId, templateId: meta.id, draftConfig })
    .returning({ id: schema.invitations.id })
  return row
}

/** A draft the given user owns, or `null` (missing and foreign look the same). */
export async function getOwnedInvitation(
  db: AnyDb,
  { id, ownerId }: { id: string; ownerId: string }
) {
  const rows = await db
    .select({
      id: schema.invitations.id,
      templateId: schema.invitations.templateId,
      status: schema.invitations.status,
      slug: schema.invitations.slug,
      draftConfig: schema.invitations.draftConfig,
      updatedAt: schema.invitations.updatedAt,
    })
    .from(schema.invitations)
    .where(
      and(
        eq(schema.invitations.id, id),
        eq(schema.invitations.ownerId, ownerId)
      )
    )
  // `.at(0)` is typed `T | undefined`; destructuring would claim a row always exists.
  return rows.at(0) ?? null
}
