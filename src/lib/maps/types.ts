import type { FC } from "react"

/** The provider-agnostic venue shape stored in every invitation (rule 11). */
export type VenuePoint = {
  name: string
  address: string
  placeName?: string
  lat?: number
  lng?: number
}

export type MapHint = "light" | "dark"

export type MapProps = {
  venue: VenuePoint
  hint: MapHint
  className?: string
}

export const MAP_PROVIDER_IDS = [
  "google-embed",
  "google-js",
  "mapbox",
  "radar",
  "leaflet",
] as const
export type MapProviderId = (typeof MAP_PROVIDER_IDS)[number]

/**
 * A display adapter renders a venue and links out to directions. Adapters
 * live in `src/lib/maps/<id>.tsx`; `registry.tsx` lazy-imports only the one
 * selected by VITE_MAP_DISPLAY_PROVIDER.
 */
export interface MapDisplayProvider {
  id: MapProviderId
  /** Coordinates required? (interactive maps cannot pin a bare address). */
  needsCoordinates: boolean
  Map: FC<MapProps>
  directionsUrl: (venue: VenuePoint) => string
}

export const hasCoords = (
  v: VenuePoint
): v is VenuePoint & { lat: number; lng: number } =>
  typeof v.lat === "number" && typeof v.lng === "number"
