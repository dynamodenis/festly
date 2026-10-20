import { publicEnv } from "@/env.public"
import { venueQuery } from "./directions"
import type { VenuePoint } from "./types"

/**
 * Google Maps embed URL. With an Embed API key we use the official endpoint
 * (free, unlimited). Without one we fall back to the classic keyless embed so
 * dev and demos still show a map.
 */
export function googleEmbedUrl(
  v: VenuePoint,
  key: string | undefined = publicEnv.VITE_GOOGLE_MAPS_EMBED_KEY
): string {
  const query =
    typeof v.lat === "number" && typeof v.lng === "number"
      ? `${v.lat},${v.lng}`
      : venueQuery(v)
  if (key) {
    const params = new URLSearchParams({ key, q: query, zoom: "15" })
    return `https://www.google.com/maps/embed/v1/place?${params.toString()}`
  }
  const params = new URLSearchParams({ q: query, z: "15", output: "embed" })
  return `https://maps.google.com/maps?${params.toString()}`
}
