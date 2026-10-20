// Idempotent seed: template metadata plus one sample invitation for a dev
// user. Driver-agnostic so tests can run it against PGlite.
import { sql } from "drizzle-orm"
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"
import {
  InvitationConfigBase,
  sampleInvitationConfig,
} from "@/templates/_shared/schema"
import * as schema from "./schema"

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>

export const DEV_USER = {
  id: "dev-user",
  email: "dev@festly.local",
  name: "Festly Dev",
} as const

export const SEED_TEMPLATES: Array<typeof schema.templatesMeta.$inferInsert> = [
  {
    id: "wedding/ivory-garden",
    category: "wedding",
    name: "Ivory Garden",
    sortOrder: 10,
  },
  {
    id: "birthday/confetti-pop",
    category: "birthday",
    name: "Confetti Pop",
    sortOrder: 20,
  },
  {
    id: "graduation/cap-and-gown",
    category: "graduation",
    name: "Cap & Gown",
    sortOrder: 30,
  },
]

export const SAMPLE_SLUG = "amara-and-kofi"

export async function seed(db: AnyDb) {
  // Validate before writing so a bad sample never reaches the database.
  const config = InvitationConfigBase.parse(sampleInvitationConfig)

  await db
    .insert(schema.templatesMeta)
    .values(SEED_TEMPLATES)
    .onConflictDoUpdate({
      target: schema.templatesMeta.id,
      set: {
        name: sql`excluded.name`,
        category: sql`excluded.category`,
        sortOrder: sql`excluded.sort_order`,
      },
    })

  await db.insert(schema.users).values(DEV_USER).onConflictDoNothing()

  await db
    .insert(schema.invitations)
    .values({
      ownerId: DEV_USER.id,
      templateId: "wedding/ivory-garden",
      slug: SAMPLE_SLUG,
      status: "published",
      draftConfig: config,
      publishedConfig: config,
      publishedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.invitations.slug,
      set: { draftConfig: config, publishedConfig: config },
    })

  return { templates: SEED_TEMPLATES.length, invitations: 1 }
}
