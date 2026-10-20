// @vitest-environment node
import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import * as schema from "@/server/db/schema"
import { DEV_USER } from "@/server/db/seed"
import { devUserAllowed } from "@/server/auth/current-user.server"
import { InvitationConfigBase } from "@/templates/_shared/schema"
import { loadTemplate } from "@/templates/registry"
import {
  UnknownTemplateError,
  createDraft,
  getOwnedInvitation,
} from "./drafts.server"

const client = new PGlite()
const db = drizzle(client, { schema, casing: "snake_case" })

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" })
  // No seed on purpose: createDraft must not depend on templates_meta rows.
  await db.insert(schema.users).values(DEV_USER)
  await db
    .insert(schema.users)
    .values({ id: "someone-else", email: "x@example.com" })
}, 30_000)

afterAll(async () => {
  await client.close()
})

describe("createDraft ('Use this template')", () => {
  it("creates a draft row with the template defaults and chosen palette", async () => {
    const { id } = await createDraft(db, {
      ownerId: DEV_USER.id,
      templateId: "birthday/confetti-pop",
      paletteId: "sunshine",
    })
    const row = await getOwnedInvitation(db, { id, ownerId: DEV_USER.id })
    expect(row).not.toBeNull()
    expect(row?.status).toBe("draft")
    expect(row?.slug).toBeNull()
    expect(row?.templateId).toBe("birthday/confetti-pop")
    expect(row?.draftConfig.theme.paletteId).toBe("sunshine")
    const module = await loadTemplate("birthday/confetti-pop")
    expect(module.schema.safeParse(row?.draftConfig).success).toBe(true)
    expect(InvitationConfigBase.safeParse(row?.draftConfig).success).toBe(true)
  })

  it("ignores unknown palettes and keeps the template default", async () => {
    const { id } = await createDraft(db, {
      ownerId: DEV_USER.id,
      templateId: "wedding/ivory-garden",
      paletteId: "not-a-palette",
    })
    const row = await getOwnedInvitation(db, { id, ownerId: DEV_USER.id })
    expect(row?.draftConfig.theme.paletteId).toBe("ivory-gold")
  })

  it("creates the templates_meta row it references", async () => {
    const rows = await db.select().from(schema.templatesMeta)
    expect(rows.map((r) => r.id).sort()).toEqual([
      "birthday/confetti-pop",
      "wedding/ivory-garden",
    ])
  })

  it("rejects unknown templates", async () => {
    await expect(
      createDraft(db, { ownerId: DEV_USER.id, templateId: "nope/missing" })
    ).rejects.toBeInstanceOf(UnknownTemplateError)
  })
})

describe("getOwnedInvitation", () => {
  it("hides other users' invitations", async () => {
    const { id } = await createDraft(db, {
      ownerId: DEV_USER.id,
      templateId: "graduation/cap-and-gown",
    })
    expect(
      await getOwnedInvitation(db, { id, ownerId: "someone-else" })
    ).toBeNull()
  })
})

describe("devUserAllowed", () => {
  const base = {
    APP_ORIGIN: "http://x",
    DATABASE_URL: undefined,
    GEOCODE_CONTACT_EMAIL: undefined,
  }
  it("is on outside production and opt-in inside it", () => {
    expect(
      devUserAllowed({
        ...base,
        NODE_ENV: "development",
        ALLOW_DEV_USER: false,
      })
    ).toBe(true)
    expect(
      devUserAllowed({ ...base, NODE_ENV: "production", ALLOW_DEV_USER: false })
    ).toBe(false)
    expect(
      devUserAllowed({ ...base, NODE_ENV: "production", ALLOW_DEV_USER: true })
    ).toBe(true)
  })
})
