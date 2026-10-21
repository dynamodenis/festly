import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import {
  UnauthorizedError,
  requireUserId,
} from "@/server/auth/current-user.server"
import { getDb } from "@/server/db/client.server"
import { SoundCloudError, resolveSoundCloud } from "./soundcloud.server"

/** Editor: turn a pasted SoundCloud link into a stored track reference. */
export const resolveSoundCloudFn = createServerFn({ method: "POST" })
  .validator(z.object({ url: z.string().trim().max(500) }))
  .handler(async ({ data }) => {
    try {
      await requireUserId(getDb())
      return await resolveSoundCloud(data.url)
    } catch (error) {
      if (
        error instanceof SoundCloudError ||
        error instanceof UnauthorizedError
      )
        throw error
      console.error("[soundcloud]", error)
      throw new Error("Could not reach SoundCloud. Please try again.")
    }
  })
