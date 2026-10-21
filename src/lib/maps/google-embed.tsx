import { publicEnv } from "@/env.public"
import { cn } from "@/lib/utils"
import { googleDirectionsUrl, venueQuery } from "./directions"
import type { MapDisplayProvider, MapProps, VenuePoint } from "./types"
import { hasCoords } from "./types"

/**
 * Google Maps embed URL. With an Embed API key we use the official endpoint
 * (free, unlimited). Without one we fall back to the classic keyless embed so
 * dev and demos still show a map.
 */
export function googleEmbedUrl(
  v: VenuePoint,
  key: string | undefined = publicEnv.VITE_GOOGLE_MAPS_EMBED_KEY
): string {
  const query = hasCoords(v) ? `${v.lat},${v.lng}` : venueQuery(v)
  if (key) {
    const params = new URLSearchParams({ key, q: query, zoom: "15" })
    return `https://www.google.com/maps/embed/v1/place?${params.toString()}`
  }
  const params = new URLSearchParams({ q: query, z: "15", output: "embed" })
  return `https://maps.google.com/maps?${params.toString()}`
}

function GoogleEmbedMap({ venue, hint, className }: MapProps) {
  return (
    <iframe
      title={`Map of ${venue.name}`}
      src={googleEmbedUrl(venue)}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
      className={cn(
        "block aspect-[4/3] w-full border-0 sm:aspect-[16/9]",
        hint === "dark" && "brightness-90 contrast-110 grayscale-[0.2]",
        className
      )}
    />
  )
}

/** Default adapter: a plain iframe, so it is SSR-safe with no JS at all. */
export const googleEmbedProvider: MapDisplayProvider = {
  id: "google-embed",
  needsCoordinates: false,
  Map: GoogleEmbedMap,
  directionsUrl: googleDirectionsUrl,
}
