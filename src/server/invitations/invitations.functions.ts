// Server functions for invitations. Safe to import from routes: the build
// replaces handlers with RPC stubs in the client bundle.
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { hasTemplate } from "@/templates/registry"
import { getDb } from "@/server/db/client.server"
import {
  UnauthorizedError,
  requireUserId,
} from "@/server/auth/current-user.server"
import { createDraft, getOwnedInvitation } from "./drafts.server"
import {
  EditorError,
  checkSlug,
  getPublishedBySlug,
  publishInvitation,
  saveDraft,
} from "./editing.server"

const CreateDraftInput = z.object({
  templateId: z.string().max(80).refine(hasTemplate, "Unknown template"),
  paletteId: z.string().max(60).optional(),
})

/** Errors the UI may show verbatim; anything else becomes a generic message. */
function publicError(error: unknown): Error {
  if (error instanceof UnauthorizedError) return error
  console.error("[invitations]", error)
  return new Error("We could not create your invitation. Please try again.")
}

/** "Use this template": create a draft for the current user. */
export const createDraftFn = createServerFn({ method: "POST" })
  .validator(CreateDraftInput)
  .handler(async ({ data }) => {
    try {
      const db = getDb()
      const ownerId = await requireUserId(db)
      const { id } = await createDraft(db, { ownerId, ...data })
      return { id }
    } catch (error) {
      throw publicError(error)
    }
  })

/** Load one of the current user's invitations for the editor. */
export const getDraftFn = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    const db = getDb()
    const ownerId = await requireUserId(db)
    const row = await getOwnedInvitation(db, { id: data.id, ownerId })
    if (!row) return null
    return {
      ...row,
      updatedAt: row.updatedAt.toISOString(),
      publishedAt: row.publishedAt?.toISOString() ?? null,
    }
  })

/** Errors the editor can act on carry a code in the message prefix. */
function editorError(error: unknown): Error {
  if (error instanceof EditorError)
    return new Error(`${error.code}: ${error.message}`)
  if (error instanceof UnauthorizedError) return error
  console.error("[editor]", error)
  return new Error("Something went wrong. Please try again.")
}

/** Autosave. Rejects with "conflict: …" when the draft changed elsewhere. */
export const saveDraftFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.uuid(),
      config: z.unknown(),
      baseUpdatedAt: z.iso.datetime({ offset: true }),
      force: z.boolean().optional(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const db = getDb()
      const ownerId = await requireUserId(db)
      return await saveDraft(db, { ownerId, ...data })
    } catch (error) {
      throw editorError(error)
    }
  })

export const checkSlugFn = createServerFn({ method: "POST" })
  .validator(z.object({ slug: z.string().max(80), id: z.uuid().optional() }))
  .handler(async ({ data }) => {
    const db = getDb()
    await requireUserId(db)
    return checkSlug(db, data)
  })

export const publishFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid(), slug: z.string().max(80) }))
  .handler(async ({ data }) => {
    try {
      const db = getDb()
      const ownerId = await requireUserId(db)
      return await publishInvitation(db, { ownerId, ...data })
    } catch (error) {
      throw editorError(error)
    }
  })

/** Public: a published invitation by slug (null when missing or archived). */
export const getPublishedFn = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().trim().toLowerCase().max(80) }))
  .handler(async ({ data }) => getPublishedBySlug(getDb(), data.slug))
