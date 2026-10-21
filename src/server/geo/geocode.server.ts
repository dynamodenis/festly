// Cached geocoding: one provider (GEOCODE_PROVIDER), results cached by the
// sha256 of the normalized query so repeat lookups never hit the provider.
import { createHash } from "node:crypto"
import { eq } from "drizzle-orm"
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"
import { serverEnv, type ServerEnv } from "@/env.server"
import * as schema from "@/server/db/schema"
import {
  googleProvider,
  mapboxProvider,
  nominatimProvider,
  radarProvider,
} from "./providers.server"
import type { GeocodeProvider, GeocodeResult } from "./types"

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>

export function normalizeQuery(query: string): string {
  return query.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ")
}

export function queryHash(provider: string, query: string): string {
  return createHash("sha256")
    .update(`${provider}:${normalizeQuery(query)}`)
    .digest("hex")
}

export function selectGeocoder(env: ServerEnv = serverEnv): GeocodeProvider {
  const nominatim = () =>
    nominatimProvider({
      userAgent: `Festly/0.1 (${env.APP_ORIGIN}${env.GEOCODE_CONTACT_EMAIL ? `; ${env.GEOCODE_CONTACT_EMAIL}` : ""})`,
      email: env.GEOCODE_CONTACT_EMAIL,
    })
  switch (env.GEOCODE_PROVIDER) {
    case "google":
      if (env.GOOGLE_GEOCODING_KEY)
        return googleProvider(env.GOOGLE_GEOCODING_KEY)
      break
    case "mapbox":
      if (env.MAPBOX_GEOCODING_TOKEN)
        return mapboxProvider(env.MAPBOX_GEOCODING_TOKEN)
      break
    case "radar":
      if (env.RADAR_SECRET_KEY) return radarProvider(env.RADAR_SECRET_KEY)
      break
    case "nominatim":
      return nominatim()
  }
  console.warn(
    `[geo] ${env.GEOCODE_PROVIDER} selected but its key is missing; using nominatim`
  )
  return nominatim()
}

/**
 * Cache hit → the stored best match. Miss → ask the provider, store the best
 * match, return all candidates (the editor lets the host pick one).
 */
export async function geocodeCached(
  db: AnyDb,
  provider: GeocodeProvider,
  query: string,
  fetchImpl: typeof fetch = fetch
): Promise<{ results: Array<GeocodeResult>; cached: boolean }> {
  const hash = queryHash(provider.id, query)
  const hit = (
    await db
      .select()
      .from(schema.geocodeCache)
      .where(eq(schema.geocodeCache.queryHash, hash))
      .limit(1)
  ).at(0)
  if (hit)
    return {
      results: [{ lat: hit.lat, lng: hit.lng, displayName: hit.displayName }],
      cached: true,
    }

  const results = await provider.geocode(normalizeQuery(query), {
    limit: 5,
    fetch: fetchImpl,
    signal: AbortSignal.timeout(10_000),
  })
  const best = results.at(0)
  if (best) {
    await db
      .insert(schema.geocodeCache)
      .values({
        queryHash: hash,
        query: normalizeQuery(query),
        lat: best.lat,
        lng: best.lng,
        displayName: best.displayName,
      })
      .onConflictDoNothing()
  }
  return { results, cached: false }
}
