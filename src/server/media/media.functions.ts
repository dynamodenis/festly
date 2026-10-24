import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { MediaKind, ObjectKey, UploadPurpose } from "@/lib/upload-policy"
import {
  UnauthorizedError,
  requireUserId,
} from "@/server/auth/current-user.server"
import { getDb } from "@/server/db/client.server"
import { getStorage } from "@/server/storage/index.server"
import {
  UploadRejectedError,
  confirmUpload,
  prepareUpload,
} from "./media.server"

function publicError(error: unknown): Error {
  if (
    error instanceof UploadRejectedError ||
    error instanceof UnauthorizedError
  )
    return error
  console.error("[media]", error)
  return new Error("Upload failed. Please try again.")
}

/** Step 1: get a short-lived signed URL to PUT the file to. */
export const createUploadUrlFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      kind: MediaKind,
      purpose: UploadPurpose,
      mime: z.string().max(100),
      bytes: z.int().positive(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const ownerId = await requireUserId(getDb())
      return await prepareUpload(getStorage(), { ownerId, ...data })
    } catch (error) {
      throw publicError(error)
    }
  })

/** Step 3: after the PUT, verify and record the asset; returns a MediaRef. */
export const confirmUploadFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      key: ObjectKey,
      kind: MediaKind,
      invitationId: z.uuid().optional(),
      width: z.int().positive().max(20_000).optional(),
      height: z.int().positive().max(20_000).optional(),
      durationSec: z.number().positive().max(3600).optional(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const db = getDb()
      const ownerId = await requireUserId(db)
      return await confirmUpload(db, getStorage(), { ownerId, ...data })
    } catch (error) {
      throw publicError(error)
    }
  })
