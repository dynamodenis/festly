import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { isShortMapLink, parseMapLink } from "@/lib/maps/parse-link"
import {
  UnauthorizedError,
  requireUserId,
} from "@/server/auth/current-user.server"
import { getDb } from "@/server/db/client.server"
import { geocodeCached, selectGeocoder } from "./geocode.server"
import { GeocodeError } from "./types"

/** Editor "Find on map": explicit lookups only (no type-ahead, per Nominatim policy). */
export const geocodeFn = createServerFn({ method: "POST" })
  .validator(z.object({ query: z.string().trim().min(3).max(200) }))
  .handler(async ({ data }) => {
    try {
      const db = getDb()
      await requireUserId(db)
      return await geocodeCached(db, selectGeocoder(), data.query)
    } catch (error) {
      if (error instanceof GeocodeError || error instanceof UnauthorizedError)
        throw error
      console.error("[geo]", error)
      throw new Error("Location search failed. Please try again.")
    }
  })

/** Expand a maps.app.goo.gl short link (server-side redirect) and parse it. */
export const parseMapsLinkFn = createServerFn({ method: "POST" })
  .validator(z.object({ url: z.url().max(2000) }))
  .handler(async ({ data }) => {
    await requireUserId(getDb())
    let target = data.url
    if (isShortMapLink(target)) {
      const res = await fetch(target, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
      })
      const host = new URL(res.url).hostname
      if (!/(^|\.)google\.[a-z.]+$/.test(host))
        throw new Error("That link did not lead to Google Maps.")
      target = res.url
    }
    return parseMapLink(target)
  })
