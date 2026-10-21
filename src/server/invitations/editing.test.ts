// @vitest-environment node
import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { deepMerge } from "@/lib/deep-merge"
import * as schema from "@/server/db/schema"
import { DEV_USER } from "@/server/db/seed"
import { createDraft, getOwnedInvitation } from "./drafts.server"
import {
  EditorError,
  checkSlug,
  getPublishedBySlug,
  publishInvitation,
  saveDraft,
} from "./editing.server"

const client = new PGlite()
const db = drizzle(client, { schema, casing: "snake_case" })
const OTHER = { id: "other-user", email: "other@example.com" }
let draftId = ""
let loadedAt = ""

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" })
  await db.insert(schema.users).values([DEV_USER, OTHER])
  draftId = (
    await createDraft(db, {
      ownerId: DEV_USER.id,
      templateId: "birthday/confetti-pop",
    })
  ).id
  loadedAt = (await getOwnedInvitation(db, {
    id: draftId,
    ownerId: DEV_USER.id,
  }))!.updatedAt.toISOString()
}, 30_000)
afterAll(async () => client.close())

async function current() {
  return (await getOwnedInvitation(db, { id: draftId, ownerId: DEV_USER.id }))!
}

describe("saveDraft", () => {
  it("saves a valid config and returns the new version", async () => {
    const config = deepMerge((await current()).draftConfig, {
      texts: { headline: "Zuri turns 7!" },
      age: 7,
    })
    const { updatedAt } = await saveDraft(db, {
      id: draftId,
      ownerId: DEV_USER.id,
      config,
      baseUpdatedAt: loadedAt,
    })
    expect((await current()).draftConfig.texts.headline).toBe("Zuri turns 7!")
    expect(updatedAt).not.toBe(loadedAt)
    loadedAt = updatedAt
  })

  it("detects a conflicting edit from another session", async () => {
    const stale = loadedAt
    const config = (await current()).draftConfig
    loadedAt = (
      await saveDraft(db, {
        id: draftId,
        ownerId: DEV_USER.id,
        config,
        baseUpdatedAt: stale,
      })
    ).updatedAt
    const attempt = saveDraft(db, {
      id: draftId,
      ownerId: DEV_USER.id,
      config,
      baseUpdatedAt: stale,
    })
    await expect(attempt).rejects.toMatchObject({ code: "conflict" })
    // `force` overwrites deliberately.
    loadedAt = (
      await saveDraft(db, {
        id: draftId,
        ownerId: DEV_USER.id,
        config,
        baseUpdatedAt: stale,
        force: true,
      })
    ).updatedAt
  })

  it("refuses invalid configs (template schema) and other owners", async () => {
    const config = deepMerge((await current()).draftConfig, { age: -3 })
    await expect(
      saveDraft(db, {
        id: draftId,
        ownerId: DEV_USER.id,
        config,
        baseUpdatedAt: loadedAt,
      })
    ).rejects.toMatchObject({
      code: "invalid",
    })
    await expect(
      saveDraft(db, {
        id: draftId,
        ownerId: OTHER.id,
        config: (await current()).draftConfig,
        baseUpdatedAt: loadedAt,
      })
    ).rejects.toMatchObject({ code: "not_found" })
  })
})

describe("slugs and publishing", () => {
  it("checks format, reserved words and uniqueness", async () => {
    expect(await checkSlug(db, { slug: "ab" })).toMatchObject({
      available: false,
    })
    expect(await checkSlug(db, { slug: "templates" })).toMatchObject({
      available: false,
      reason: expect.stringMatching(/reserved/),
    })
    expect(await checkSlug(db, { slug: "zuri-turns-seven" })).toEqual({
      available: true,
    })
  })

  it("publishes the draft and serves it publicly", async () => {
    expect(await getPublishedBySlug(db, "zuri-turns-seven")).toBeNull()
    const published = await publishInvitation(db, {
      id: draftId,
      ownerId: DEV_USER.id,
      slug: "Zuri-Turns-Seven",
    })
    expect(published.slug).toBe("zuri-turns-seven")
    const page = await getPublishedBySlug(db, "zuri-turns-seven")
    expect(page?.templateId).toBe("birthday/confetti-pop")
    expect(page?.config.texts.headline).toBe("Zuri turns 7!")
    expect((await current()).status).toBe("published")
    // Its own slug is still "available" to itself (republish), not to others.
    expect(
      await checkSlug(db, { slug: "zuri-turns-seven", id: draftId })
    ).toEqual({ available: true })
    expect(await checkSlug(db, { slug: "zuri-turns-seven" })).toMatchObject({
      available: false,
    })
  })

  it("keeps the published version until the next publish", async () => {
    const config = deepMerge((await current()).draftConfig, {
      texts: { headline: "Draft-only change" },
    })
    loadedAt = (
      await saveDraft(db, {
        id: draftId,
        ownerId: DEV_USER.id,
        config,
        baseUpdatedAt: (await current()).updatedAt.toISOString(),
      })
    ).updatedAt
    expect(
      (await getPublishedBySlug(db, "zuri-turns-seven"))?.config.texts.headline
    ).toBe("Zuri turns 7!")
  })

  it("refuses a slug another invitation owns", async () => {
    const second = await createDraft(db, {
      ownerId: DEV_USER.id,
      templateId: "wedding/ivory-garden",
    })
    const attempt = publishInvitation(db, {
      id: second.id,
      ownerId: DEV_USER.id,
      slug: "zuri-turns-seven",
    })
    await expect(attempt).rejects.toBeInstanceOf(EditorError)
    await expect(attempt).rejects.toMatchObject({ code: "slug_taken" })
  })
})
