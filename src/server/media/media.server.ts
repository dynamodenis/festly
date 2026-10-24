// Upload lifecycle: sign → (browser PUTs bytes to storage) → confirm.
// Pure functions over a db and a storage driver so tests run them on PGlite
// with an in-memory driver.
import { randomUUID } from "node:crypto"
import { and, eq } from "drizzle-orm"
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"
import {
  PURPOSE_KIND,
  checkUpload,
  newObjectKey,
  ownerPrefix,
  type MediaKind,
  type UploadPurpose,
} from "@/lib/upload-policy"
import * as schema from "@/server/db/schema"
import type { StorageDriver } from "@/server/storage/types"

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>

/** A rejection whose message is safe to show the uploader. */
export class UploadRejectedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "UploadRejectedError"
  }
}

export async function prepareUpload(
  storage: StorageDriver,
  input: {
    ownerId: string
    kind: MediaKind
    purpose: UploadPurpose
    mime: string
    bytes: number
  }
) {
  if (PURPOSE_KIND[input.purpose] !== input.kind) {
    throw new UploadRejectedError(
      `A ${input.purpose} upload must be ${PURPOSE_KIND[input.purpose] === "image" ? "a photo" : "an audio file"}.`
    )
  }
  const verdict = checkUpload(input.kind, input.mime, input.bytes)
  if (!verdict.ok) throw new UploadRejectedError(verdict.reason)
  const key = newObjectKey(input.ownerId, input.mime, randomUUID())
  const target = await storage.createUploadTarget({
    key,
    mime: input.mime,
    bytes: input.bytes,
  })
  return { key, upload: target }
}

export type ConfirmInput = {
  ownerId: string
  key: string
  kind: MediaKind
  invitationId?: string
  width?: number
  height?: number
  durationSec?: number
}

/**
 * Verify the object really exists with an allowed type and size (the browser
 * could have uploaded anything), then record it. Idempotent per key.
 */
export async function confirmUpload(
  db: AnyDb,
  storage: StorageDriver,
  input: ConfirmInput
) {
  if (!input.key.startsWith(ownerPrefix(input.ownerId))) {
    throw new UploadRejectedError("That upload does not belong to you.")
  }
  if (input.invitationId) {
    const owned = await db
      .select({ id: schema.invitations.id })
      .from(schema.invitations)
      .where(
        and(
          eq(schema.invitations.id, input.invitationId),
          eq(schema.invitations.ownerId, input.ownerId)
        )
      )
    if (owned.length === 0)
      throw new UploadRejectedError("Invitation not found.")
  }

  const info = await storage.head(input.key)
  if (!info)
    throw new UploadRejectedError(
      "The upload did not arrive. Please try again."
    )
  const verdict = checkUpload(input.kind, info.mime, info.bytes)
  if (!verdict.ok) {
    await storage.delete(input.key)
    throw new UploadRejectedError(verdict.reason)
  }

  await db
    .insert(schema.mediaAssets)
    .values({
      ownerId: input.ownerId,
      invitationId: input.invitationId,
      kind: input.kind,
      key: input.key,
      mime: info.mime,
      bytes: info.bytes,
      width: input.width,
      height: input.height,
      durationSec: input.durationSec,
    })
    .onConflictDoNothing({ target: schema.mediaAssets.key })

  return {
    assetKey: input.key,
    url: storage.publicUrl(input.key),
    mime: info.mime,
    bytes: info.bytes,
    width: input.width,
    height: input.height,
  }
}
