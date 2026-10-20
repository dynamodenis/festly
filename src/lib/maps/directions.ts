import type { VenuePoint } from "./types"

const hasCoords = (
  v: VenuePoint
): v is VenuePoint & { lat: number; lng: number } =>
  typeof v.lat === "number" && typeof v.lng === "number"

/** Human query used when no coordinates exist. */
export function venueQuery(v: VenuePoint): string {
  return [v.placeName ?? v.name, v.address].filter(Boolean).join(", ")
}

export function googleDirectionsUrl(v: VenuePoint): string {
  const destination = hasCoords(v) ? `${v.lat},${v.lng}` : venueQuery(v)
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}

export function wazeUrl(v: VenuePoint): string {
  if (hasCoords(v))
    return `https://waze.com/ul?ll=${v.lat},${v.lng}&navigate=yes`
  return `https://waze.com/ul?q=${encodeURIComponent(venueQuery(v))}&navigate=yes`
}

export function appleMapsUrl(v: VenuePoint): string {
  const q = encodeURIComponent(venueQuery(v))
  if (hasCoords(v)) return `https://maps.apple.com/?ll=${v.lat},${v.lng}&q=${q}`
  return `https://maps.apple.com/?q=${q}`
}

export const directionLinks = (v: VenuePoint) => [
  { label: "Google Maps", href: googleDirectionsUrl(v) },
  { label: "Waze", href: wazeUrl(v) },
  { label: "Apple Maps", href: appleMapsUrl(v) },
]
