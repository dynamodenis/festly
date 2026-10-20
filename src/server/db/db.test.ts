// @vitest-environment node
// Runs the real generated migrations and the seed against in-memory Postgres
// (PGlite), so `drizzle/` and the schema are checked without a server.
import { PGlite } from "@electric-sql/pglite"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { DEV_USER, SAMPLE_SLUG, SEED_TEMPLATES, seed } from "./seed"
import * as schema from "./schema"
import type { InvitationConfigBase } from "@/templates/_shared/schema"

const client = new PGlite()
const db = drizzle(client, { schema, casing: "snake_case" })

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" })
}, 30_000)

afterAll(async () => {
  await client.close()
})

describe("database", () => {
  it("seeds idempotently", async () => {
    await seed(db)
    await seed(db)
    const templates = await db.select().from(schema.templatesMeta)
    const invitations = await db.select().from(schema.invitations)
    expect(templates).toHaveLength(SEED_TEMPLATES.length)
    expect(invitations).toHaveLength(1)
  })

  it("round-trips the typed jsonb config", async () => {
    const [row] = await db
      .select()
      .from(schema.invitations)
      .where(eq(schema.invitations.slug, SAMPLE_SLUG))
    // Compile-time check: the column is typed with the Zod output type.
    const config: InvitationConfigBase = row.draftConfig
    expect(config.hosts[0].shortName).toBe("Amara")
    expect(config.venue.lat).toBeCloseTo(-1.2195)
  })

  it("enforces unique, well-formed slugs", async () => {
    const base = {
      ownerId: DEV_USER.id,
      templateId: "wedding/ivory-garden",
      draftConfig: (await db.select().from(schema.invitations))[0].draftConfig,
    }
    await expect(
      db.insert(schema.invitations).values({ ...base, slug: SAMPLE_SLUG })
    ).rejects.toThrow()
    await expect(
      db.insert(schema.invitations).values({ ...base, slug: "Bad Slug!" })
    ).rejects.toThrow()
    await expect(
      db.insert(schema.invitations).values({ ...base, status: "published" })
    ).rejects.toThrow()
  })

  it("counts page views once per invitation per day", async () => {
    const [inv] = await db.select().from(schema.invitations)
    const view = { invitationId: inv.id, day: "2027-06-01", count: 1 }
    await db.insert(schema.pageViews).values(view)
    await expect(db.insert(schema.pageViews).values(view)).rejects.toThrow()
  })

  it("cascades deletes from invitations to responses", async () => {
    const [inv] = await db.select().from(schema.invitations)
    await db.insert(schema.rsvps).values({
      invitationId: inv.id,
      guestName: "Guest",
      attending: "yes",
      partySize: 2,
      ipHash: "h",
      userAgentHash: "h",
    })
    await db.delete(schema.invitations).where(eq(schema.invitations.id, inv.id))
    expect(await db.select().from(schema.rsvps)).toHaveLength(0)
    expect(await db.select().from(schema.pageViews)).toHaveLength(0)
  })
})
