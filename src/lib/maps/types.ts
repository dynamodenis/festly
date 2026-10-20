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
  /** Lazy-load the embed until it nears the viewport. */
  lazy?: boolean
}

/**
 * A display adapter renders a venue and knows how to link out to directions.
 * Adapters live in `src/lib/maps/<id>.tsx`; the registry lazy-imports only
 * the one selected by env (Phase 4 adds the rest and `/dev/maps`).
 */
export interface MapDisplayProvider {
  id: "google-embed" | "google-js" | "mapbox" | "radar" | "leaflet"
  Map: FC<MapProps>
  directionsUrl: (venue: VenuePoint) => string
}
