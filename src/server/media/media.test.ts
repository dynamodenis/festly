// @vitest-environment node
import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import * as schema from "@/server/db/schema"
import { DEV_USER } from "@/server/db/seed"
import type { StorageDriver } from "@/server/storage/types"
import {
  UploadRejectedError,
  confirmUpload,
  prepareUpload,
} from "./media.server"

const client = new PGlite()
const db = drizzle(client, { schema, casing: "snake_case" })

/** In-memory driver: tests "upload" by writing to the map directly. */
function memoryStorage() {
  const objects = new Map<string, { bytes: number; mime: string }>()
  const deleted: Array<string> = []
  const driver: StorageDriver = {
    id: "local",
    createUploadTarget: async ({ key, mime }) => ({
      url: `https://upload.test/${key}`,
      method: "PUT",
      headers: { "Content-Type": mime },
      expiresAt: new Date().toISOString(),
    }),
    head: async (key) => objects.get(key) ?? null,
    delete: async (key) => {
      objects.delete(key)
      deleted.push(key)
    },
    publicUrl: (key) => `https://cdn.test/${key}`,
  }
  return { driver, objects, deleted }
}

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" })
  await db.insert(schema.users).values(DEV_USER)
}, 30_000)
afterAll(async () => client.close())

describe("upload lifecycle", () => {
  it("signs an owner-scoped key, then records the confirmed asset", async () => {
    const { driver, objects } = memoryStorage()
    const { key, upload } = await prepareUpload(driver, {
      ownerId: DEV_USER.id,
      kind: "image",
      purpose: "portrait",
      mime: "image/webp",
      bytes: 500_000,
    })
    expect(key).toMatch(/^useruploads\/dev-user\/[0-9a-f-]{36}\.webp$/)
    expect(upload.headers["Content-Type"]).toBe("image/webp")

    objects.set(key, { bytes: 480_000, mime: "image/webp" })
    const ref = await confirmUpload(db, driver, {
      ownerId: DEV_USER.id,
      key,
      kind: "image",
      width: 2400,
      height: 1600,
    })
    expect(ref).toMatchObject({
      assetKey: key,
      url: `https://cdn.test/${key}`,
      bytes: 480_000,
      width: 2400,
    })

    // Confirming twice is harmless.
    await confirmUpload(db, driver, {
      ownerId: DEV_USER.id,
      key,
      kind: "image",
    })
    const rows = await db.select().from(schema.mediaAssets)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      key,
      ownerId: DEV_USER.id,
      kind: "image",
      bytes: 480_000,
    })
  })

  it("rejects disallowed files before signing", async () => {
    const { driver } = memoryStorage()
    await expect(
      prepareUpload(driver, {
        ownerId: DEV_USER.id,
        kind: "image",
        purpose: "gallery",
        mime: "image/gif",
        bytes: 10,
      })
    ).rejects.toBeInstanceOf(UploadRejectedError)
    await expect(
      prepareUpload(driver, {
        ownerId: DEV_USER.id,
        kind: "image",
        purpose: "music",
        mime: "image/webp",
        bytes: 10,
      })
    ).rejects.toThrow(/must be an audio file/)
    await expect(
      prepareUpload(driver, {
        ownerId: DEV_USER.id,
        kind: "audio",
        purpose: "music",
        mime: "audio/mpeg",
        bytes: 11 * 1024 * 1024,
      })
    ).rejects.toThrow(/Too large/)
  })

  it("deletes an object whose real type or size breaks the rules", async () => {
    const { driver, objects, deleted } = memoryStorage()
    const key = "useruploads/dev-user/image/sneaky.webp"
    objects.set(key, { bytes: 1000, mime: "text/html" })
    await expect(
      confirmUpload(db, driver, { ownerId: DEV_USER.id, key, kind: "image" })
    ).rejects.toThrow(/Unsupported/)
    expect(deleted).toContain(key)
  })

  it("refuses missing uploads and other users' keys", async () => {
    const { driver } = memoryStorage()
    await expect(
      confirmUpload(db, driver, {
        ownerId: DEV_USER.id,
        key: "useruploads/dev-user/image/nope.webp",
        kind: "image",
      })
    ).rejects.toThrow(/did not arrive/)
    await expect(
      confirmUpload(db, driver, {
        ownerId: DEV_USER.id,
        key: "useruploads/someone-else/image/x.webp",
        kind: "image",
      })
    ).rejects.toThrow(/does not belong/)
  })
})
