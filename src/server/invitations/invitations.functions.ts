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
    return { ...row, updatedAt: row.updatedAt.toISOString() }
  })
