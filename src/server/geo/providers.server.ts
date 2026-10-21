// Geocoder adapters (rule 11). Each maps its provider's JSON to GeocodeResult.
import {
  GeocodeError,
  inRange,
  type GeocodeProvider,
  type GeocodeResult,
} from "./types"

const keep = (r: GeocodeResult) => inRange(r.lat, r.lng)

async function json(res: Response, provider: string): Promise<unknown> {
  if (res.status === 429)
    throw new GeocodeError(
      `${provider} is rate-limiting requests; try again shortly.`
    )
  if (!res.ok)
    throw new GeocodeError(`${provider} geocoding failed (${res.status}).`)
  return res.json()
}

/* ---------- Nominatim (OpenStreetMap) ---------- */

type NominatimHit = {
  lat: string
  lon: string
  display_name: string
  name?: string
}

let lastNominatimCall = 0
let queue: Promise<void> = Promise.resolve()

/** Nominatim policy: at most 1 request/second for the whole app. */
export function nominatimSlot(
  now: () => number = Date.now,
  wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
) {
  const slot = queue.then(async () => {
    const delay = lastNominatimCall + 1000 - now()
    if (delay > 0) await wait(delay)
    lastNominatimCall = now()
  })
  queue = slot.catch(() => {})
  return slot
}

export function resetNominatimThrottle() {
  lastNominatimCall = 0
  queue = Promise.resolve()
}

export function nominatimProvider(opts: {
  userAgent: string
  email?: string
}): GeocodeProvider {
  return {
    id: "nominatim",
    async geocode(query, { limit, fetch, signal }) {
      await nominatimSlot()
      const params = new URLSearchParams({
        q: query,
        format: "jsonv2",
        limit: String(limit),
      })
      if (opts.email) params.set("email", opts.email)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          headers: { "User-Agent": opts.userAgent, Accept: "application/json" },
          signal,
        }
      )
      const hits = (await json(res, "OpenStreetMap")) as Array<NominatimHit>
      return hits
        .map((h) => ({
          lat: Number(h.lat),
          lng: Number(h.lon),
          displayName: h.display_name,
          placeName: h.name || undefined,
        }))
        .filter(keep)
    },
  }
}

/* ---------- Google Geocoding API ---------- */

type GoogleResponse = {
  status: string
  error_message?: string
  results: Array<{
    formatted_address: string
    geometry: { location: { lat: number; lng: number } }
  }>
}

export function googleProvider(key: string): GeocodeProvider {
  return {
    id: "google",
    async geocode(query, { limit, fetch, signal }) {
      const params = new URLSearchParams({ address: query, key })
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
        { signal }
      )
      const data = (await json(res, "Google")) as GoogleResponse
      if (data.status === "ZERO_RESULTS") return []
      if (data.status !== "OK")
        throw new GeocodeError(`Google geocoding failed (${data.status}).`)
      return data.results
        .slice(0, limit)
        .map((r) => ({
          lat: r.geometry.location.lat,
          lng: r.geometry.location.lng,
          displayName: r.formatted_address,
        }))
        .filter(keep)
    },
  }
}

/* ---------- Mapbox Geocoding v6 ---------- */

type MapboxResponse = {
  features: Array<{
    geometry: { coordinates: [number, number] }
    properties: {
      full_address?: string
      name?: string
      place_formatted?: string
    }
  }>
}

export function mapboxProvider(token: string): GeocodeProvider {
  return {
    id: "mapbox",
    async geocode(query, { limit, fetch, signal }) {
      const params = new URLSearchParams({
        q: query,
        access_token: token,
        limit: String(limit),
      })
      const res = await fetch(
        `https://api.mapbox.com/search/geocode/v6/forward?${params.toString()}`,
        { signal }
      )
      const data = (await json(res, "Mapbox")) as MapboxResponse
      return data.features
        .map((f) => ({
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          displayName:
            f.properties.full_address ??
            [f.properties.name, f.properties.place_formatted]
              .filter(Boolean)
              .join(", "),
          placeName: f.properties.name,
        }))
        .filter(keep)
    },
  }
}

/* ---------- Radar ---------- */

type RadarResponse = {
  addresses: Array<{
    latitude: number
    longitude: number
    formattedAddress: string
    placeLabel?: string
  }>
}

export function radarProvider(secretKey: string): GeocodeProvider {
  return {
    id: "radar",
    async geocode(query, { limit, fetch, signal }) {
      const params = new URLSearchParams({ query })
      const res = await fetch(
        `https://api.radar.io/v1/geocode/forward?${params.toString()}`,
        {
          headers: { Authorization: secretKey },
          signal,
        }
      )
      const data = (await json(res, "Radar")) as RadarResponse
      return data.addresses
        .slice(0, limit)
        .map((a) => ({
          lat: a.latitude,
          lng: a.longitude,
          displayName: a.formattedAddress,
          placeName: a.placeLabel,
        }))
        .filter(keep)
    },
  }
}
